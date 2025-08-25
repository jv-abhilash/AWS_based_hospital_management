const File = require("../models/File");
const multer = require('multer');
const crypto = require('crypto');
const { S3Client ,PutObjectCommand ,GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { SNSClient, PublishCommand,SubscribeCommand } = require('@aws-sdk/client-sns');
const snsClient = new SNSClient({ region: "us-east-1" });

// Creating an S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});


// S3 Buckets Added New all 4 functions
// Set up storage configuration
const storage = multer.memoryStorage(); // Store files in memory

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 20 * 1024 * 1024 // limit file size to 20MB
    },
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    }
});

// Function to check file type
function checkFileType(file, cb) {
    // Allowed ext
    const filetypes = /jpeg|jpg|png|gif|pdf/;
    // Check ext
    const extname = filetypes.test(file.originalname.toLowerCase());
    // Check mime
    const mimetype = filetypes.test(file.mimetype);

    if(mimetype && extname) {
        return cb(null,true);
    } else {
        cb('Error: Images and PDFs Only!');
    }
}

const uploadFileToS3 = async (fileBuffer, fileName, mimeType ,patientId) => {
  try {
    const uploadParams = {
      Bucket: process.env.S3_BUCKET,
      Key: `${patientId}/${Date.now()}_${fileName}`,
      Body: fileBuffer,
      ACL: 'private',
      ContentType: mimeType,
      ServerSideEncryption: "aws:kms",
      SSEKMSKeyId: process.env.S3_SSE
    };

    const command = new PutObjectCommand(uploadParams);
    await s3Client.send(command);
    return {
      Key: uploadParams.Key  // Ensure the Key is returned correctly
    };
  } catch (error) {
    console.error('Error uploading file to S3:', error);
    throw error;
  }
};

// Endpoint to handle file upload
exports.uploadFiles = upload.single('file');

exports.handleUpload = async (req, res) => {
  const { fileName, description, appointmentId,patientId } = req.body;  // Assuming these are sent in the request
  const file = req.file;
  console.log(fileName,description,appointmentId,patientId);
  if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
  }

  // Calculate hash
  const hash = crypto.createHash('sha256').update(file.buffer).digest('hex');

  try {
      const s3Response = await uploadFileToS3(file.buffer, file.originalname, file.mimetype,patientId);

      const fileUrl = `https://${process.env.S3_BUCKET}.s3.amazonaws.com/${s3Response.Key}`;

      // Create a new file document in MongoDB
      const newFile = new File({
          appointmentId: appointmentId,
          fileName: s3Response.Key ,
          fileHash: hash,
          description: file.originalname,
          fileUrl: fileUrl,
          uploadedDate: new Date()
      });

      await newFile.save();
      const command = new GetObjectCommand({
        Bucket: process.env.S3_BUCKET,
        Key: s3Response.Key
      });
      console.log(`File Name while uploading = ${fileName}`);//Remove after Debug
      
      const url = await getSignedUrl(s3Client, command, { expiresIn: 300 });
      //SNS service
      const params = {
        Message: `Your Prescription is Ready and you can view on and the link is valid for 1 hour ${url}.`,
        TopicArn: 'arn:aws:sns:us-east-1:992382740511:record-h',
        MessageAttributes: {
          'patientId': {
            DataType: 'String',
            StringValue: patientId.toString()
          }
        }
    };

    try {
      const data = await snsClient.send(new PublishCommand(params));
      console.log("Message sent:", data.MessageId);
    } catch (error) {
      console.error("Error sending message:", error);
    }
      res.status(201).json({ message: "File uploaded and record saved successfully", file: newFile });
  } catch (error) {
      console.error('Failed to upload to S3 and save record:', error);
      res.status(500).json({ error: error.message });
  }
};



exports.viewFiles = async (req, res) => {
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
        //SNS Service
        const params = {
          Message: `Your File is accessed by ${username} for evaluation.`,
          TopicArn: 'arn:aws:sns:us-east-1:992382740511:Notification',
          MessageAttributes: {
            'patientId': {
              DataType: 'String',
              StringValue: patientId.toString()
            }
          }
      };
  
      try {
        const data = await snsClient.send(new PublishCommand(params));
        console.log("Message sent:", data.MessageId);
      } catch (error) {
        console.error("Error sending message:", error);
      } logger.info(`User ${username} accessed ${fileName}`, {
        user: username,
        action: `accessed ${fileName}`
    });
        res.json({ url: url });
    } catch (err) {
        console.log('Error getting signed URL:', err);
        res.status(500).send('Cannot create signed URL');
    }
};

const getHashFromDatabase = async (filename) => {
  try {
      const fileRecord = await File.findOne({ fileName: filename }).exec();
      if (fileRecord) {
          return fileRecord.fileHash;
      } else {
          console.log('No file found with the given name:', filename);
          return null;  // or throw new Error("File not found");
      }
  } catch (error) {
      console.error('Database access error:', error);
      throw error;  // Rethrow or handle as needed
  }
}


exports.downloadFiles = (req, res) => {
  const {filename, username,patientId }= req.query;
  console.log('The PatientId is:',patientId);
  const fileName = filename.split('/').pop();
  console.log('The file name to be downloaded is:',filename);
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
        //SNS Service
        const params = {
          Message: `Your File is accessed by ${username} for evaluation.`,
          TopicArn: 'arn:aws:sns:us-east-1:992382740511:Notification',
          MessageAttributes: {
            'patientId': {
              DataType: 'String',
              StringValue: patientId.toString()
            }
          }
      
        };
  
      try {
        const data = await snsClient.send(new PublishCommand(params));
        console.log("Message sent:", data.MessageId);
      } catch (error) {
        console.error("Error sending message:", error);
      }   logger.info(`User ${username} accessed ${filename}`, {
        user: username,
        action: `accessed ${filename}`
    });     
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



// Fetch the file for particular appointment.
exports.fetchFilesByAppointmentID = async (req, res) => {
  try {
      const files = await File.find({ appointmentId: req.params.appointmentId });
      if (!files.length) {
          return res.status(404).json({ message: 'No files found for this appointment.' });
      }
      res.json(files);
  } catch (error) {
      console.error('Error fetching files:', error);
      res.status(500).json({ error: 'Failed to retrieve files' });
  }
};