import {JWK, parseJwk} from 'jose/jwk/parse'
import {SignJWT} from 'jose/jwt/sign'
import {jwtVerify, JWTVerifyOptions} from 'jose/jwt/verify'

export class JWTAuth {
    //alg = "HS256"
    alg = "HS512"

    constructor(private jwtSecret: string) {
    }

    async createUserJWT(user: string, sessionId): Promise<string> {
        let privateKey = await this.getSecret();
        let yesterday = new Date(new Date().getTime() - (24 * 60 * 60 * 1000));
        const jwt = await new SignJWT({
            typ: "access"
        }).setProtectedHeader({alg: this.alg, typ: "JWT"})
            .setIssuedAt(Math.ceil(yesterday.getTime() / 1000))
            .setIssuer("ret")
            .setAudience("ret")
            .setNotBefore(Math.ceil(yesterday.getTime() / 1000) - 1)
            .setExpirationTime('8h')
            .setSubject(user)
            .setJti(sessionId)
            .sign(privateKey);
        //console.log(jwt);
        return jwt;
    }

    async getSecret() {
        //https://jwt.io/
        //let token = jwt.sign({ "role": 'ret_admin' }, jwtSecret);
        //let token = "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJyZXQiLCJleHAiOjE2MjM2Nzc4NzUsImlhdCI6MTYxNjQyMDI3NSwiaXNzIjoicmV0IiwianRpIjoiMTBkMWFkZmYtYjBlMi00N2RkLWFiMTgtMjY3MGY0ZDVhMTFkIiwibmJmIjoxNjE2NDIwMjc0LCJzdWIiOiI2NDA0MDcwNTA5NjYyNjk5NjEiLCJ0eXAiOiJhY2Nlc3MifQ.qp29Ip4AKkpRPtVVOUikytL1u-lGPJidUglsWlW8H9izgdRsoH_c0yZuA04Miwi6K2iN-GsoCr8Kd1fTH0yp2g";//token from store.state.credentials.token
        let jwtSecretBase64 = Buffer.from(this.jwtSecret).toString('base64');
        return await parseJwk({
            'alg': this.alg,
            'kty': 'oct',
            'k': jwtSecretBase64,
        });
    }

    async createPostgrestJWT(): Promise<String> {
        let privateKey = await this.getSecret();
        const jwt = await new SignJWT({
            //'role': 'ret_admin',
            //'postgrest_role': 'ret_admin'
            'role': 'postgres',
            'postgrest_role': 'postgres'
        }).setProtectedHeader({alg: this.alg, typ: "JWT"}).sign(privateKey);
        return jwt;
    }

    async verifyAndDecode(jwt: string,claimVerification:JWTVerifyOptions) {
        let publicKey = await this.getSecret();
        const { payload, protectedHeader } = await jwtVerify(jwt, publicKey, claimVerification);
        return payload;
    }
}