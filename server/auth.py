import requests
from fastapi import HTTPException, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt
from jose.exceptions import JWTError, ExpiredSignatureError
from typing import Dict

JWKS_URL = "https://clerk.booksmartly.darleyplex.com/.well-known/jwks.json"
ALGORITHMS = ["RS256"]

http_bearer = HTTPBearer()

def get_jwks():
    resp = requests.get(JWKS_URL)
    resp.raise_for_status()
    return resp.json()["keys"]

def get_public_key(token: str, jwks: Dict):
    unverified_header = jwt.get_unverified_header(token)
    for key in jwks:
        if key["kid"] == unverified_header["kid"]:
            return jwt.construct_rsa_public_key(key)
    raise HTTPException(status_code=401, detail="Public key not found.")

def verify_clerk_jwt(credentials: HTTPAuthorizationCredentials = Security(http_bearer)):
    token = credentials.credentials
    try:
        jwks = get_jwks()
        public_key = get_public_key(token, jwks)
        payload = jwt.decode(token, public_key, algorithms=ALGORITHMS, audience=None)
        return payload
    except ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired.")
    except JWTError as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Auth error: {str(e)}")