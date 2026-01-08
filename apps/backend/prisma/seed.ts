import { PrismaClient, GymStatus, BookingStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting seed...');

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const admin = await prisma.admin.upsert({
        where: { email: 'admin@flexfit.com' },
        update: {},
        create: {
            email: 'admin@flexfit.com',
            password: hashedPassword,
            name: 'FlexFit Admin',
        },
    });
    console.log('✅ Admin created:', admin.email);

    // Create test gym owner
    const gymOwner = await prisma.gymOwner.upsert({
        where: { email: 'owner@testgym.com' },
        update: {},
        create: {
            email: 'owner@testgym.com',
            name: 'Test Gym Owner',
            phone: '+919876543210',
            supabaseUid: 'test-owner-supabase-uid',
        },
    });
    console.log('✅ Gym owner created:', gymOwner.email);

    // Create test user
    const user = await prisma.user.upsert({
        where: { email: 'user@test.com' },
        update: {},
        create: {
            email: 'user@test.com',
            name: 'Test User',
            phone: '+919876543211',
            age: 25,
            gender: 'Male',
            supabaseUid: 'test-user-supabase-uid',
        },
    });
    console.log('✅ User created:', user.email);

    // Create sample gyms (Mumbai + Ahmedabad for testing)
    const gyms = [
        // Ahmedabad Gyms
        {
            name: 'Gold Gym Ahmedabad',
            description: 'Premium fitness center with world-class equipment in the heart of Ahmedabad.',
            address: 'CG Road, Navrangpura, Ahmedabad, Gujarat',
            latitude: 23.0300,
            longitude: 72.5600,
            dayPassPrice: 349,
            amenities: ['Cardio', 'Weights', 'Parking', 'Shower', 'Locker', 'AC', 'Trainer', 'Sauna'],
            images: [
                'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800',
                'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800',
            ],
            openingHours: {
                mon: '5:00-23:00',
                tue: '5:00-23:00',
                wed: '5:00-23:00',
                thu: '5:00-23:00',
                fri: '5:00-23:00',
                sat: '6:00-22:00',
                sun: '7:00-20:00',
            },
            rules: 'Wear proper gym attire. Carry a towel. Re-rack weights after use.',
            status: GymStatus.APPROVED,
            ownerId: gymOwner.id,
        },
        {
            name: 'FitZone SG Highway',
            description: 'Modern gym with CrossFit arena and personal training. Best equipment in town!',
            address: 'SG Highway, Near Iscon Cross Roads, Ahmedabad, Gujarat',
            latitude: 23.0350,
            longitude: 72.5050,
            dayPassPrice: 249,
            amenities: ['Cardio', 'Weights', 'CrossFit', 'Parking', 'Shower', 'Locker', 'AC', 'Cafe'],
            images: [
                'https://images.unsplash.com/photo-1581009146145-b5ef050c149a?w=800',
                'https://images.unsplash.com/photo-1558611848-73f7eb4001a1?w=800',
            ],
            openingHours: {
                mon: '6:00-22:00',
                tue: '6:00-22:00',
                wed: '6:00-22:00',
                thu: '6:00-22:00',
                fri: '6:00-22:00',
                sat: '7:00-21:00',
                sun: '8:00-18:00',
            },
            rules: 'No phones in CrossFit area. Wipe equipment after use.',
            status: GymStatus.APPROVED,
            ownerId: gymOwner.id,
        },
        {
            name: 'Muscle Hub Satellite',
            description: 'Hardcore gym for serious lifters. Focus on strength and bodybuilding.',
            address: 'Satellite Road, Jodhpur Cross Roads, Ahmedabad, Gujarat',
            latitude: 23.0200,
            longitude: 72.5100,
            dayPassPrice: 199,
            amenities: ['Weights', 'Parking', 'Shower', 'Locker', 'Supplements'],
            images: [
                'https://images.unsplash.com/photo-1593079831268-3381b0db4a77?w=800',
                'https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=800',
            ],
            openingHours: {
                mon: '5:00-23:00',
                tue: '5:00-23:00',
                wed: '5:00-23:00',
                thu: '5:00-23:00',
                fri: '5:00-23:00',
                sat: '6:00-22:00',
                sun: '7:00-20:00',
            },
            rules: 'Re-rack your weights. No chalk without permission.',
            status: GymStatus.APPROVED,
            ownerId: gymOwner.id,
        },
        {
            name: 'Yoga & Fitness Prahladnagar',
            description: 'Peaceful environment for yoga, pilates and light workouts.',
            address: 'Prahladnagar Garden Road, Ahmedabad, Gujarat',
            latitude: 23.0150,
            longitude: 72.5200,
            dayPassPrice: 299,
            amenities: ['Cardio', 'Yoga Studio', 'Parking', 'Shower', 'Locker', 'AC'],
            images: [
                'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=800',
                'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800',
            ],
            openingHours: {
                mon: '6:00-21:00',
                tue: '6:00-21:00',
                wed: '6:00-21:00',
                thu: '6:00-21:00',
                fri: '6:00-21:00',
                sat: '7:00-19:00',
                sun: '7:00-17:00',
            },
            rules: 'Maintain silence in yoga studio. Shoes not allowed on mats.',
            status: GymStatus.APPROVED,
            ownerId: gymOwner.id,
        },
        // Mumbai Gyms (keeping for diversity)
        {
            name: 'PowerFit Gym Mumbai',
            description: 'Premium fitness center with state-of-the-art equipment.',
            address: '123 Fitness Street, Andheri West, Mumbai',
            latitude: 19.1362,
            longitude: 72.8296,
            dayPassPrice: 299,
            amenities: ['Cardio', 'Weights', 'Parking', 'Shower', 'Locker', 'AC', 'Trainer'],
            images: [
                'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800',
            ],
            openingHours: {
                mon: '6:00-22:00',
                tue: '6:00-22:00',
                wed: '6:00-22:00',
                thu: '6:00-22:00',
                fri: '6:00-22:00',
                sat: '8:00-20:00',
                sun: '8:00-18:00',
            },
            rules: 'Wear proper gym attire.',
            status: GymStatus.APPROVED,
            ownerId: gymOwner.id,
        },
    ];

    for (const gymData of gyms) {
        const gym = await prisma.gym.create({
            data: gymData,
        });
        console.log(`✅ Gym created: ${gym.name} (${gym.status})`);
    }

    // Create a sample booking
    const approvedGym = await prisma.gym.findFirst({
        where: { status: GymStatus.APPROVED },
    });

    if (approvedGym) {
        const booking = await prisma.booking.create({
            data: {
                bookingCode: 'FLX-TEST01',
                userId: user.id,
                gymId: approvedGym.id,
                bookingDate: new Date(),
                amount: approvedGym.dayPassPrice,
                status: BookingStatus.CONFIRMED,
                qrCode: 'data:image/png;base64,TEST_QR_CODE',
            },
        });
        console.log('✅ Sample booking created:', booking.bookingCode);
    }

    console.log('🎉 Seed completed successfully!');
}

main()
    .catch((e) => {
        console.error('❌ Seed failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
