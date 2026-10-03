import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const wordQuestions = [
    
]

async function main() {
    await prisma.wordQuestion.deleteMany();
    await prisma.wordQuestion.createMany({
        data: wordQuestions
    });

    console.log(`${wordQuestions.length} questions seeded successfully.`);
}

main()
    .catch((error) => {
        console.error(error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

//npx prisma db seed