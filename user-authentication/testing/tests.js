
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

const deleteData = await fetch("http://localhost:5000/api/database-reset", {
    method: "DELETE"
});

const registerResult = await registerData.json();
console.log("Register Result:", registerResult);

const loginResult = await loginData.json();
console.log("Login Result:", loginResult);

const deleteResult = await deleteData.json();
console.log("Delete Result:", deleteResult);