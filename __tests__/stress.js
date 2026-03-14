// stress.js - run with: node __tests__/stress.js

// Simulate 50 concurrent checkouts hitting the API
const NUM_REQUESTS = 50;
const API_URL = 'http://localhost:3000/api/verify';

async function runTest() {
  console.log(`🚀 Starting Stress Test: ${NUM_REQUESTS} concurrent requests to ${API_URL}...`);
  const startTime = Date.now();

  try {
    // Create a dummy text file to act as the "slip" image for the test
    const dummyBlob = new Blob(["dummy content"], { type: "image/jpeg" });
    
    // Simulate valid order data
    const orderData = {
      items: [
        { title: "SQUAD TRACK CROP", size: "M", quantity: 2, style: "CROP" },
      ],
      total: 590
    };
    
    const formDataObj = {
      firstName: "Test",
      lastName: "User",
      phone: "0999999999",
      address: "123 Test St",
      zipCode: "10120",
      socialContact: "test_ig"
    };

    // Prepare requests
    const requests = Array.from({ length: NUM_REQUESTS }).map(async () => {
      const form = new FormData();
      form.append("file", dummyBlob, "test-slip.jpg");
      form.append("orderData", JSON.stringify(orderData));
      form.append("formData", JSON.stringify(formDataObj));

      const reqStart = Date.now();
      try {
        const res = await fetch(API_URL, {
          method: 'POST',
          body: form,
        });
        const data = await res.json();
        const duration = Date.now() - reqStart;
        
        return { success: res.ok, status: res.status, duration, data };
      } catch (err) {
        return { success: false, error: err.message, duration: Date.now() - reqStart };
      }
    });

    // Execute all concurrently
    const results = await Promise.all(requests);
    const endTime = Date.now();
    const totalTime = (endTime - startTime) / 1000;

    // Analyze Results
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    const avgDuration = results.reduce((acc, r) => acc + r.duration, 0) / NUM_REQUESTS;
    
    // It's expected that most will "fail" because the dummy slip is invalid to the RDCW API,
    // What we care about is that the server doesn't crash (returns 200 or 400 cleanly, not 500s).
    const serverErrors = results.filter(r => r.status === 500).length;

    console.log(`\n📊 --- TEST RESULTS ---`);
    console.log(`Total Time     : ${totalTime.toFixed(2)}s`);
    console.log(`Requests/sec   : ${(NUM_REQUESTS / totalTime).toFixed(2)}`);
    console.log(`Avg Latency    : ${avgDuration.toFixed(2)}ms`);
    console.log(`Successful API : ${successful}`);
    console.log(`Rejected API   : ${failed} (Expected due to dummy slip)`);
    console.log(`Server Crashes : ${serverErrors} (Should be 0)`);
    console.log(`\nSample Response:`, results[0].data);

    if (serverErrors > 0) {
      console.error(`❌ STRESS TEST FAILED: The server crashed ${serverErrors} times under load.`);
    } else {
      console.log(`✅ STRESS TEST PASSED: The server handled the load successfully without crashing.`);
    }

  } catch (error) {
    console.error("Test execution failed:", error);
  }
}

// We need node version 18+ for native fetch
runTest();
