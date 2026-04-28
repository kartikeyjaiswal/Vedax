import { Client, Databases, ID } from 'node-appwrite';
const client = new Client()
    .setEndpoint("https://cloud.appwrite.io/v1")
    .setProject("69da3f34000eb22a337d")
    .setKey("standard_b113cf6c344ee61de015579ff156fca2dfbc0035a42c115ec45ed1385f89ed5e37caa5c07044f690c36a2f7d0791dd7b7b122f89cf468f8ae451d20e183cab2de8a5bd11a76386a90d8c92477fe552fce232dc65c1158d7f0ec681b058adfb8a8038e990f30a090bb5b1411693d68f2b1eeb2d732569dedf3e9fdd3d26a4428f");

const databases = new Databases(client);

async function createTestUserDoc() {
    try {
        const doc = await databases.createDocument(
            "ecogamify_db",
            "users",
            "69f08ba9000539704827", // accountId of the test user we just created
            {
                name: "Test User",
                email: "test2@vedax.com",
                role: "student",
                points: 0,
                level: 1,
                badges: [],
                streakCount: 0,
                ecoScore: 0,
                tasksCompleted: 0,
                quizzesCompleted: 0,
                lastActive: new Date().toISOString()
            }
        );
        console.log("Test user doc created:", doc.$id);
    } catch (error) {
        if (error.code === 409) {
            console.log("User doc already exists");
        } else {
            console.error("Failed to create user doc:", error.message);
        }
    }
}

createTestUserDoc();
