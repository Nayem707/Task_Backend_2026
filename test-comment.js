/**
 * Test script to check comments in database
 */

const { getPrismaClient } = require("./src/config/database");

const prisma = getPrismaClient();

async function checkComments() {
  try {
    // Get all comments
    const comments = await prisma.comment.findMany({
      select: {
        id: true,
        content: true,
        postId: true,
        parentId: true,
        userId: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 10,
    });

    console.log("\n=== Recent Comments ===");
    console.log(`Found ${comments.length} comments:\n`);

    comments.forEach((comment, index) => {
      console.log(`${index + 1}. Comment ID: ${comment.id}`);
      console.log(`   Content: ${comment.content.substring(0, 50)}...`);
      console.log(`   Post ID: ${comment.postId}`);
      console.log(`   Parent ID: ${comment.parentId || "None (top-level)"}`);
      console.log(`   Created: ${comment.createdAt}`);
      console.log("");
    });

    // Get all posts
    const posts = await prisma.post.findMany({
      select: {
        id: true,
        content: true,
        userId: true,
        _count: {
          select: {
            comments: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
    });

    console.log("=== Recent Posts ===");
    console.log(`Found ${posts.length} posts:\n`);

    posts.forEach((post, index) => {
      console.log(`${index + 1}. Post ID: ${post.id}`);
      console.log(`   Content: ${post.content.substring(0, 50)}...`);
      console.log(`   Comments: ${post._count.comments}`);
      console.log("");
    });
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkComments();
