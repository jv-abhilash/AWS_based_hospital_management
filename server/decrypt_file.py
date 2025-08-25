from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives import padding
import base64
import time

def decrypt_data_aes(data, key, iv):
    
    #starting timer
    start_time = time.time()
    
    #decoded_key = base64.b64decode(key)
    # Ensure the key is the correct size for the chosen algorithm (e.g., AES-256)
    if len(key) not in {16, 24, 32}:
        raise ValueError("AES key must be 128, 192, or 256 bits long")

    # Ensure the IV is the correct size for the chosen mode (e.g., 16 bytes for AES)
    if len(iv) != 16:
        raise ValueError("Initialization vector (IV) must be 16 bytes long")

    # Create an AES cipher with the provided key and CBC mode with the specified IV
    cipher = Cipher(algorithms.AES(key), modes.CBC(iv), backend=default_backend())

    # Create a decryptor object
    decryptor = cipher.decryptor()

    # Decrypt the data
    decrypted_data_aes = decryptor.update(data) + decryptor.finalize()
    
    # Remove padding
    unpadder = padding.PKCS7(algorithms.AES.block_size).unpadder() # type: ignore
    
    # Unpad the decrypted data
    unpadded_data = unpadder.update(decrypted_data_aes)
    unpadded_data += unpadder.finalize()
    print("Length of unpadded data after decryption:", len(unpadded_data))
    
    end_time = time.time()
    execution_time = end_time - start_time
    print(f"Execution time of Decryption using AES: {execution_time} seconds")

    return unpadded_data