import os
import sys
import boto3
from botocore.exceptions import NoCredentialsError

def retrive_file_from_s3(bucket_name, s3_object_name, local_file_name):
    s3_client = boto3.client('s3')
    try:
        s3_client.download_file(bucket_name, s3_object_name, local_file_name)
        print(f"Success: {local_file_name}")
        return True
    except FileNotFoundError:
        print(f"The file {local_file_name} was not found")
        return False
    except NoCredentialsError:
        print("Credentials not available")
        return False
    except Exception as e:
        print(f"An error occurred: {e}")
        return False


if __name__ == "__main__":

    # Collect command line arguments
    if len(sys.argv) != 3:
        print("Usage: python retrive_file_from_s3.py <bucket_name> <s3_object_name> <local_file_name>")
        sys.exit(1)
    
    bucket_name = 'records-h'
    s3_object_name = sys.argv[1] #'1722199854354_bob.png'
    #filepath = r'C:\Users\Abhilash\OneDrive\Desktop\aws'
    local_file_name = sys.argv[2] #os.path.join(filepath,s3_object_name)
    
    # Ensure local directory exists
    if not os.path.exists(os.path.dirname(local_file_name)):
        os.makedirs(os.path.dirname(local_file_name))
        
    #download the file
    if retrive_file_from_s3(bucket_name, s3_object_name, local_file_name):
        sys.exit(0)  # Success exit code
    
    else:
        sys.exit(1)  # Error exit code