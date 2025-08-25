from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives import padding
from cryptography.hazmat.primitives.ciphers import algorithms
import base64
import time
import secrets
from os import urandom

#This key can be created using passphrase
# Below are the functions for AES-256/3DES key generation and writing to the file aes.bin
def generate_key(key_size,file_path):
    if key_size not in [192,256]:
        raise ValueError("Invalid key size. Use 192,256 bits.")

    # Generate a random key using secrets module
    key = secrets.token_bytes(key_size // 8)
    print(f"Key of {key_size}:", key.hex())
    
    # Saving the generated AES/3DES key to the file
    with open(file_path, 'wb') as file:
        file.write(key)
    return key

def generate_iv(filename,iv_size):
    # Generate a random IV (16 bytes for AES, 8 bytes for 3DES)
    iv = urandom(iv_size)
    with open(filename, 'wb') as iv_file:
        iv_file.write(iv)
    return iv


def encrypt_data_aes(data, key, iv):
    
    # starting the timer
    start_time = time.time()
    
    #decoded_key = base64.b64decode(key)
    # Ensure the key is the correct size for the chosen algorithm (e.g., AES-256)
    if len(key) not in {16, 24, 32}:
        raise ValueError("AES key must be 128, 192, or 256 bits long")

    # Ensure the IV is the correct size for the chosen mode (e.g., 16 bytes for AES)
    if len(iv) != 16:
        raise ValueError("Initialization vector (IV) must be 16 bytes long")

    # Get the size of the original data before padding
    original_data_size = len(data)
    
    # Create an AES cipher with the provided key and CBC mode with the specified IV
    cipher = Cipher(algorithms.AES(key), modes.CBC(iv), backend=default_backend())

    # Create an encryptor object
    encryptor = cipher.encryptor()
    
    # PKCS#7 Padding
    padder = padding.PKCS7(algorithms.AES.block_size).padder() # type: ignore
    padded_data = padder.update(data) + padder.finalize()
    
    print("The size of the original data:",original_data_size)
    print("Length of padded data before encryption:", len(padded_data))

    # Encrypt the padded data
    ciphertext_aes = encryptor.update(padded_data) + encryptor.finalize()
    
    end_time = time.time()
    execution_time = end_time - start_time
    print(f"Execution time of Encryption using AES: {execution_time} seconds")
    
    return ciphertext_aes