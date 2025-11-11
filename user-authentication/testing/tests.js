const bcryptjs = require('bcryptjs');
const password = "password123";
let authToken = null;


//////////////////////////////////
// HELPER FUNCTIONS FOR TESTING //
//////////////////////////////////


const testRoutine = async () => {
    await testHashing();
    await testRegister();
    await testLogin();
    await tokenTest();
    await testDelete();
};

const testHashing = async () => {
    let hashedPassword = await bcryptjs.hash(password, 10);

    if ((await bcryptjs.compare("wrongpassword", hashedPassword)) === false && (await bcryptjs.compare(password, hashedPassword)) === true)
        console.log("testHashing: PASSED");
    else
        console.log("testHashing: FAILED");
};

// Simulate API requests

const testRegister = async () => {
    const registerData = await fetch("http://localhost:5000/api/register", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            email: "test@example.com",
            password: "password123",
            username: "testuser"
        })
    });
        
    //const registerResult = await registerData.json();
    //console.log(registerResult);
    if (registerData.status === 201)
        console.log("testRegister: PASSED");
    else
        console.log("testRegister: FAILED");
};

const testLogin = async () => {
    const loginData = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            email: "test@example.com",
            password: "password123"
        })
    });
      
    const result = await loginData.json();
    const token = result.token;

    authToken = token;

    if (loginData.status === 200 && token)
        console.log("testLogin: PASSED");
    else
        console.log("testLogin: FAILED");
};

const tokenTest = async () => {
    const token = authToken;
    const response = await fetch("http://localhost:5000/api/token-route", {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });
    if (response.status === 200)
        console.log("tokenTest: PASSED");
    else
        console.log("tokenTest: FAILED");  
}

const testDelete = async () => {
    const deleteData = await fetch("http://localhost:5000/api/database-reset", {
        method: "DELETE"
    });

    if (deleteData.status === 200)
        console.log("testDelete: PASSED");
    else
        console.log("testDelete: FAILED");
};

/////////////////
// Main script //
/////////////////

testRoutine();

