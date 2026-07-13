/**
 * Seed script — implements DATABASE_DESIGN.md §6.
 * Run with: npm run db:seed -w apps/backend
 *
 * Seeds: 2 admin accounts, the real 5-bus BUBT fleet (routes/stops/buses/drivers),
 * a Regular schedule with Sun-Thu/Friday templates, an inactive Holiday schedule,
 * today's generated trips, and one sample notice.
 *
 * NOTE: stop coordinates below are approximate placeholders — real GPS coordinates
 * must replace these before production, per the flag raised in DATABASE_DESIGN.md §6.
 */
import bcrypt from 'bcrypt';
import { PrismaClient, DayGroup } from '@prisma/client';

const prisma = new PrismaClient();

const BUS_ROUTES: Array<{
  busNumber: string;
  routeName: string;
  stops: Array<{ name: string; lat: number; lng: number }>;
}> = [
  {
    busNumber: 'Buriganga',
    routeName: 'Asad Gate - Shyamoli - Mirpur 1 - Rainkhola - BUBT',
    stops: [
      { name: 'Asad Gate', lat: 23.7639, lng: 90.3667 },
      { name: 'Shyamoli', lat: 23.7719, lng: 90.3654 },
      { name: 'Mirpur 1', lat: 23.7961, lng: 90.354 },
      { name: 'Rainkhola', lat: 23.8079, lng: 90.355 },
      { name: 'BUBT Campus', lat: 23.8213, lng: 90.3541 },
    ],
  },
  {
    busNumber: 'Padma',
    routeName: 'Shyamoli (Shishumela) - Agargaon - Kazipara - Mirpur 10 - Proshika - BUBT',
    stops: [
      { name: 'Shyamoli (Shishumela)', lat: 23.7735, lng: 90.3651 },
      { name: 'Agargaon', lat: 23.7783, lng: 90.3742 },
      { name: 'Kazipara', lat: 23.7986, lng: 90.3707 },
      { name: 'Mirpur 10', lat: 23.8062, lng: 90.3687 },
      { name: 'Proshika', lat: 23.814, lng: 90.364 },
      { name: 'BUBT Campus', lat: 23.8213, lng: 90.3541 },
    ],
  },
  {
    busNumber: 'Meghna',
    routeName: 'Mirpur 14 - Mirpur 10 (Original) - Mirpur 11 - Proshika - BUBT',
    stops: [
      { name: 'Mirpur 14', lat: 23.8151, lng: 90.3823 },
      { name: 'Mirpur 10 (Original)', lat: 23.8062, lng: 90.3687 },
      { name: 'Mirpur 11', lat: 23.8177, lng: 90.3661 },
      { name: 'Proshika', lat: 23.814, lng: 90.364 },
      { name: 'BUBT Campus', lat: 23.8213, lng: 90.3541 },
    ],
  },
  {
    busNumber: 'Jamuna',
    routeName: 'ECB Square - Kalshi Bridge - Mirpur 12 - Duaripara - BUBT',
    stops: [
      { name: 'ECB Square', lat: 23.8285, lng: 90.3773 },
      { name: 'Kalshi Bridge', lat: 23.8306, lng: 90.3697 },
      { name: 'Mirpur 12', lat: 23.8296, lng: 90.3654 },
      { name: 'Duaripara', lat: 23.8258, lng: 90.3599 },
      { name: 'BUBT Campus', lat: 23.8213, lng: 90.3541 },
    ],
  },
  {
    busNumber: 'Brahmaputra',
    routeName:
      'Nabinagar - Jahangirnagar - Savar - Hemayetpur - Aminbazar - Gabtoli - Mazar Road - Mirpur 1 - BUBT',
    stops: [
      { name: 'Nabinagar', lat: 23.8802, lng: 90.2707 },
      { name: 'Jahangirnagar', lat: 23.8811, lng: 90.2665 },
      { name: 'Savar', lat: 23.8583, lng: 90.2667 },
      { name: 'Hemayetpur', lat: 23.7986, lng: 90.282 },
      { name: 'Aminbazar', lat: 23.7935, lng: 90.3193 },
      { name: 'Gabtoli', lat: 23.7826, lng: 90.3466 },
      { name: 'Mazar Road', lat: 23.7869, lng: 90.3498 },
      { name: 'Mirpur 1', lat: 23.7961, lng: 90.354 },
      { name: 'BUBT Campus', lat: 23.8213, lng: 90.3541 },
    ],
  },
];

async function main() {
  console.log('Seeding admin accounts...');
  const admin1Hash = await bcrypt.hash('Bubt@Trans2026!A', 10);
  const admin2Hash = await bcrypt.hash('Bubt@Trans2026!B', 10);

  await prisma.user.upsert({
    where: { adminId: 'admin.transport1' },
    update: {},
    create: {
      role: 'admin',
      name: 'Primary Administrator',
      adminId: 'admin.transport1',
      passwordHash: admin1Hash,
    },
  });

  await prisma.user.upsert({
    where: { adminId: 'admin.transport2' },
    update: {},
    create: {
      role: 'admin',
      name: 'Secondary Administrator',
      adminId: 'admin.transport2',
      passwordHash: admin2Hash,
    },
  });

  console.log('Seeding routes, stops, buses, and drivers...');
  for (const [index, config] of BUS_ROUTES.entries()) {
    const route = await prisma.route.create({
      data: {
        name: config.routeName,
        stops: {
          create: config.stops.map((stop, order) => ({
            name: stop.name,
            latitude: stop.lat,
            longitude: stop.lng,
            stopOrder: order,
          })),
        },
      },
    });

    const bus = await prisma.bus.create({
      data: { busNumber: config.busNumber, routeId: route.id },
    });

    const driverPasswordHash = await bcrypt.hash(`Driver@${config.busNumber}2026`, 10);
    await prisma.user.create({
      data: {
        role: 'driver',
        name: `${config.busNumber} Driver`,
        driverId: `DRV-00${index + 1}`,
        phone: `01700000${index}0${index}`,
        bloodGroup: 'O+',
        nidOrLicense: `NID-${1000 + index}`,
        address: 'Dhaka, Bangladesh',
        emergencyContact: `01800000${index}0${index}`,
        assignedBusId: bus.id,
        joiningDate: new Date(),
        mustChangePassword: true,
        passwordHash: driverPasswordHash,
      },
    });
  }

  console.log('Seeding Regular schedule with Sun-Thu / Friday templates...');
  const buses = await prisma.bus.findMany();

  const regularSchedule = await prisma.schedule.create({
    data: { name: 'Regular', type: 'regular', isActive: true },
  });

  // Sun-Thu and Friday timing pattern per the real BUBT notice (approximate —
  // verify exact per-bus minute-level times with the transport office before
  // treating this as production data, per DATABASE_DESIGN.md §6 note).
  const sunThuTimes = ['07:15', '17:30'];
  const fridayTimes = ['07:30', '13:30'];

  for (const bus of buses) {
    for (const time of sunThuTimes) {
      await prisma.scheduleTripTemplate.create({
        data: {
          scheduleId: regularSchedule.id,
          busId: bus.id,
          dayGroup: DayGroup.sun_thu,
          departureTime: new Date(`1970-01-01T${time}:00Z`),
        },
      });
    }
    for (const time of fridayTimes) {
      await prisma.scheduleTripTemplate.create({
        data: {
          scheduleId: regularSchedule.id,
          busId: bus.id,
          dayGroup: DayGroup.friday,
          departureTime: new Date(`1970-01-01T${time}:00Z`),
        },
      });
    }
  }

  console.log('Seeding a Holiday schedule (inactive, zero templates — represents Eid closure)...');
  await prisma.schedule.create({
    data: { name: 'Eid-ul-Fitr Holiday', type: 'holiday', isActive: false },
  });

  console.log('Seeding a sample notice...');
  const anyAdmin = await prisma.user.findFirstOrThrow({ where: { role: 'admin' } });
  await prisma.notice.create({
    data: {
      title: 'Eid-ul-Adha Holiday Notice',
      body: 'The university will remain closed from June 15 to June 20 on the occasion of Eid-ul-Adha. Bus services will resume on June 21.',
      category: 'holiday',
      createdBy: anyAdmin.id,
    },
  });

  console.log('Seed complete.');
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
