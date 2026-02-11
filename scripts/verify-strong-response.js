const http = require('http');

// Mock Data
const mockQuestion = "Tell me about a time you had a conflict with a coworker.";
const mockTips = {
    lookingFor: "Conflict resolution skills",
    pointsToCover: ["Situation", "Action", "Result"],
    answerFramework: "STAR Method",
    industrySpecifics: { metrics: "N/A", tools: "Jira" },
    mistakesToAvoid: ["Blaming others", "Being passive"],
    proTip: "Focus on the solution"
};

const data = JSON.stringify({
    question: mockQuestion,
    tips: mockTips
});

const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/response/generate',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length,
    },
};

console.log('Testing Strong Response API...');

const req = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);

    let responseData = '';

    res.on('data', (chunk) => {
        responseData += chunk;
    });

    res.on('end', () => {
        console.log('Response Body:');
        try {
            const json = JSON.parse(responseData);
            console.log(JSON.stringify(json, null, 2));

            if (json.strongResponse && json.whyThisWorks) {
                console.log('\n✅ Verification PASSED: Strong response and breakdown received.');
            } else {
                console.error('\n❌ Verification FAILED: Missing required fields.');
                process.exit(1);
            }
        } catch (e) {
            console.log(responseData);
            console.error('\n❌ Verification FAILED: Invalid JSON response.');
            process.exit(1);
        }
    });
});

req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
    process.exit(1);
});

req.write(data);
req.end();
