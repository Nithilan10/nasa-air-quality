from getpass import getpass
import os
from pathlib import Path


def get_credentials():
# Prefer environment variables
    username = os.getenv('EARTHDATA_USER')
    password = os.getenv('EARTHDATA_PASS')
    if username and password:
        return username, password


# Fallback to interactive prompt (useful in dev)
    print('No EARTHDATA_USER/PASS in environment — prompt for credentials (won\'t be saved)')
    username = input('Earthdata username: ').strip()
    password = getpass('Earthdata password: ')
    return username, password


if __name__ == '__main__':
    user, pwd = get_credentials()
    print('Username loaded:', user)