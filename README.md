#Steps for execution

note - you will need replica of mongo db to execute transaction API

To install dependency
npm install

To Start application under port 3000:
npm run dev


All the required request and response formats are defind in Swagger doc you can hit all api from that URL or from Postman

Visit http://localhost:3000/v1/docs/  - Swagger Doc
1 - hit POST auth/register api
2 - change role from user to admin in db 
3 - hit POST auth/login api  - with admin credentials
4 - paste token received in above response to Authorize - top right corner (to use further apis)
5 - Create users POST /users
6 - Create user's account (using _id from db) with different types and balance POST /account
8 - hit POST account/transfer



 
