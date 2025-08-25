const File = require("../models/File");
const Appointment = require("../models/Appointment");
const {Patient} = require("../models/Patient");

//All files Tab
exports.getPatientsAllFilesByUserName =  async (req, res) => {
    const { username } = req.params;
  
    try {
        const patient = await Patient.findOne({ name: username });
        if (!patient) {
            return res.status(404).json({ message: "Patient not found" });
        }
  
        res.json({ patientId: patient.id });
    } catch (error) {
        console.error('Failed to fetch patient:', error);
        res.status(500).send('Server error');
    }
  };
  
  
exports.getAllFilesByID = async (req, res) => {
    const { patientId } = req.params;
    console.log("PatientId:",patientId);
  
    try {
        // First, find all completed appointments for this patient
        const appointments = await Appointment.find({
            patient: patientId,
            status: "completed"
        }).populate({
            path: 'doctorId', // Assuming 'doctorId' is a reference in the Appointment schema
            select: 'name'
        });
        console.log("Appointments",appointments);
  
        if (appointments.length === 0) {
            return res.status(404).json({ message: "No completed appointments found for this patient." });
        }
  
        // Fetch files for these appointments
        const files = await File.find({
            appointmentId: { $in: appointments.map(app => app._id) }
        }).populate({
            path: 'appointmentId',
            select: 'doctorId',
            populate: {
                path: 'doctorId',
                select: 'name'
            }
        });
  
        console.log("The files are :",files);
        if (files.length === 0) {
            return res.status(404).json({ message: "No files found for completed appointments." });
        }
  
        // Group files by doctor's name
        const filesByDoctor = files.reduce((acc, file) => {
            const doctorName = file.appointmentId.doctorId.name;
            if (!acc[doctorName]) {
                acc[doctorName] = [];
            }
            acc[doctorName].push(file);
            return acc;
        }, {});
  
        console.log("The files by Doctor are:",filesByDoctor);
        res.json(filesByDoctor);
    } catch (error) {
        console.error('Failed to fetch files:', error);
        res.status(500).send('Server error');
    }
  };

  //ViewURL for patientId
exports.viewAllFilesOnline =  async (req, res) => {
    const { fileName,username,patientId } = req.query;
    console.log("Username in server:", username);
    console.log("The Patient Id: ",patientId);
      const command = new GetObjectCommand({
          Bucket: process.env.S3_BUCKET,
          Key: fileName
      });
      console.log(`File Name while uploading = ${fileName}`);// Remove after debug
  
      try {
          const url = await getSignedUrl(s3Client, command, { expiresIn: 300 });
          res.json({ url: url });
      } catch (err) {
          console.log('Error getting signed URL:', err);
          res.status(500).send('Cannot create signed URL');
      }
  };
  
  //Download for patientId
exports.downloadPatientAllFile = (req, res) => {
    const {filename, username,patientId }= req.query;
    console.log('The PatientId is:',patientId);
    const fileName = filename.split('/').pop();
    const localFileName = path.join('C:\\Users\\Abhilash\\OneDrive\\Desktop\\aws',fileName);
    console.log("Username in server:", username);
    
    console.log(`Attempting to download: ${filename} to ${localFileName}`);
    // Construct the command to run your Python script
    const command = `python aws_s3.py "${filename}" "${localFileName}"`;
  
    // Execute the Python script
    exec(command, async (error, stdout, stderr) => {
        if (error) {
            console.error(`exec error: ${error}`);
            return res.status(500).json({ success: false, message: 'Failed to download file.' });
        }
        if (stdout.startsWith('Success:')) {
          //const localFilePath = stdout.split(':')[1].trim();
          console.log(`File downloaded to: ${localFileName}`);
  
          // Calculate file hash
          const fileBuffer = fs.readFileSync(localFileName);
          const hashSum = crypto.createHash('sha256');
          hashSum.update(fileBuffer);
          const hex = hashSum.digest('hex');
          // Assume function to get hash from database
          const expectedHash = await getHashFromDatabase(filename);
  
          if (hex === expectedHash) {     
            res.json({ success: true, message: 'File integrity verified successfully.', filePath: localFileName, hash: hex });
        } else {
            res.status(400).json({ success: false, message: 'File integrity verification failed.' });
        }
      }else {
        console.error(`Python script error: ${stdout}`);
        res.status(500).json({ success: false, message: stdout });
    }
    });  
};
  