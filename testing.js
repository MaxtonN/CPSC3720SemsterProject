const fetch = global.fetch;
async function simulateRequests(url){
    const requests = Array.from({ length: 10}, () =>{
        fetch(url, { method: "POST"}).then(res => {
            console.log(`${res.status} ${res.statusText}`);
        });
    });

    const responses = await Promise.allSettled(requests);
}

clientServiceURL = "http://localhost:6001/api/events/5/purchase";
adminServiceURL = "http://localhost:5001/api/admin/events";


simulateRequests(clientServiceURL);