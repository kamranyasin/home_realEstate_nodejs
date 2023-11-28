const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seed() {
  try {
    await prisma.user.createMany({
      data: [
        {
          firstname: 'super',
          lastname: 'admin',
          gender: 'Male',
          email: 'admin@gmail.com',
          phoneno: 1234567890,
          dataOfBirth: new Date('1990-01-01'),
          password: '$2a$12$11oOp6pPzLCiPnAlhegk/.wYO5/ylJxTR5BceQkKtpg0diz.axHHS',
          description: 'Lorem ipsum dolor sit amet',
          address: '123 Street, City',
          zipCode: '12345',
          media: '["sarim-1687763644198.png"]',
          type: 'admin',
        },
      ],
    });

    await prisma.properties.createMany({
      data: [
        {
          userid: 1,
          property_type: "House",
          property_status: "Sale",
          property_price: 200000,
          max_rooms: 4,
          beds: 3,
          baths: 2,
          area: "1200 sqft",
          price: 180000,
          agencies: "ABC Realty",
          description: "Beautiful house for sale",
          address: "123 Main St",
          zipCode: "12345",
          country: "USA",
          city: "New York",
          land_mark: "Near Park",
          media: ["ralph-ravi-kayden-jdbvxignfda-unsplash-1687648505798.jpg", "ralph-ravi-kayden-mdwoo5pexpe-unsplash-1687648505815.jpg"],
          video_url: "https://example.com/video",
          additional_features: ["Feature 1", "Feature 2" ],
          views: 100,
          slug: "house-for-sale",
          s_access: "admin",
        },
      ],
    });

    console.log('Seed data created successfully.');
  } catch (error) {
    console.error('Error creating seed data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
