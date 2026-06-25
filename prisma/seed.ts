import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import bcrypt from "bcryptjs";

const url = process.env.DATABASE_URL ?? "file:./dev.db";
const adapter = new PrismaBetterSqlite3({ url });
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const prisma = new PrismaClient({ adapter } as any);

const menuItems = [
  { name: "Gà Rán Giòn Original", description: "Công thức bí mật 11 loại thảo mộc và gia vị, lớp vỏ giòn tan, thịt thơm mềm.", category: "ga_ran", price: 39000, imageEmoji: "🍗", popular: true, prepTime: 8 },
  { name: "Gà Rán Extra Crispy", description: "Lớp bột dày giòn đặc biệt, thơm ngon hơn, giòn hơn gấp đôi so với Original.", category: "ga_ran", price: 42000, imageEmoji: "🍗", popular: true, prepTime: 10 },
  { name: "Gà Popcorn", description: "Những miếng gà nhỏ giòn tan, dễ ăn, hoàn hảo cho bữa snack hoặc khai vị.", category: "ga_ran", price: 35000, imageEmoji: "🍿", popular: true, prepTime: 6 },
  { name: "Gà Tenders", description: "Phi lê ức gà nguyên miếng tẩm bột giòn, chấm với sốt KFC đặc biệt.", category: "ga_ran", price: 55000, imageEmoji: "🍗", popular: false, prepTime: 8 },
  { name: "Gà Cay Zinger", description: "Gà rán cay xé lưỡi với lớp vỏ giòn, hương vị đậm đà, dành cho người thích cay.", category: "ga_ran", price: 44000, imageEmoji: "🌶️", popular: true, prepTime: 8 },
  { name: "Cánh Gà KFC", description: "Cánh gà giòn vàng ươm, thấm gia vị đậm đà, ăn kèm sốt BBQ hoặc cay.", category: "ga_ran", price: 45000, imageEmoji: "🍗", popular: true, prepTime: 9 },
  { name: "Colonel Burger", description: "Burger cổ điển với miếng gà giòn, rau xà lách, cà chua tươi và sốt Colonel đặc biệt.", category: "burger", price: 55000, imageEmoji: "🍔", popular: true, prepTime: 5 },
  { name: "Zinger Burger", description: "Miếng gà cay giòn phủ đầy sốt cay đặc biệt, rau tươi, phô mai tan chảy.", category: "burger", price: 60000, imageEmoji: "🍔", popular: true, prepTime: 5 },
  { name: "Double Crunch Burger", description: "Hai miếng gà giòn chồng lên nhau, phô mai Cheddar, sốt mayo đặc biệt.", category: "burger", price: 75000, imageEmoji: "🍔", popular: false, prepTime: 6 },
  { name: "Tower Burger", description: "Burger tháp cao với gà giòn, hash brown, phô mai, rau tươi và sốt đặc trưng.", category: "burger", price: 72000, imageEmoji: "🍔", popular: true, prepTime: 7 },
  { name: "Cơm Gà KFC", description: "Cơm trắng dẻo thơm ăn kèm gà rán giòn, rau luộc và sốt đặc biệt.", category: "com", price: 55000, imageEmoji: "🍚", popular: true, prepTime: 6 },
  { name: "Cơm Thịt Nướng BBQ", description: "Cơm ăn kèm thịt gà nướng BBQ đậm vị, sốt teriyaki Nhật Bản, rau xanh tươi.", category: "com", price: 65000, imageEmoji: "🍚", popular: false, prepTime: 7 },
  { name: "Cơm Cá Rán", description: "Cơm trắng với miếng cá phi lê rán giòn, rau tươi và sốt tartar.", category: "com", price: 58000, imageEmoji: "🐟", popular: false, prepTime: 8 },
  { name: "Pepsi", description: "Pepsi lon lạnh mát, giải khát tức thì.", category: "do_uong", price: 18000, imageEmoji: "🥤", popular: true, prepTime: 1 },
  { name: "Mirinda Cam", description: "Nước ngọt Mirinda vị cam tươi mát, sủi bọt.", category: "do_uong", price: 18000, imageEmoji: "🍊", popular: false, prepTime: 1 },
  { name: "7UP", description: "Nước chanh sủi bọt mát lạnh, thanh mát dễ chịu.", category: "do_uong", price: 18000, imageEmoji: "💚", popular: false, prepTime: 1 },
  { name: "Trà Sữa KFC", description: "Trà sữa thơm ngon đặc biệt của KFC với hạt trân châu.", category: "do_uong", price: 35000, imageEmoji: "🧋", popular: true, prepTime: 3 },
  { name: "Nước Ép Cam Tươi", description: "Cam tươi ép nguyên chất, giàu vitamin C, không thêm đường.", category: "do_uong", price: 28000, imageEmoji: "🍊", popular: false, prepTime: 2 },
  { name: "Combo 1 - Cá Nhân", description: "1 miếng gà + khoai tây chiên vừa + nước uống. Tiết kiệm hơn 25% so với mua lẻ.", category: "combo", price: 75000, imageEmoji: "🎁", popular: true, prepTime: 10 },
  { name: "Combo 2 - Gia Đình", description: "4 miếng gà + 2 phần khoai + 4 nước uống + 1 bánh mì. Lý tưởng cho cả gia đình.", category: "combo", price: 265000, imageEmoji: "👨‍👩‍👧‍👦", popular: true, prepTime: 15 },
  { name: "Combo Zinger + Khoai", description: "Burger Zinger cay + khoai chiên giòn vừa + Pepsi lạnh. Bộ đôi hoàn hảo.", category: "combo", price: 89000, imageEmoji: "🌶️", popular: true, prepTime: 8 },
  { name: "Combo Cơm Gà Đôi", description: "2 phần cơm gà KFC + 2 nước uống. Bữa trưa lý tưởng cho cặp đôi.", category: "combo", price: 118000, imageEmoji: "💑", popular: false, prepTime: 12 },
  { name: "Kem Tươi Soft Serve", description: "Kem mềm mịn ngọt ngào, phủ sốt chocolate hoặc caramel.", category: "trang_miem", price: 20000, imageEmoji: "🍦", popular: true, prepTime: 2 },
  { name: "Sundae Chocolate", description: "Kem vanilla phủ sốt chocolate đậm đà, topping hạnh nhân giòn.", category: "trang_miem", price: 28000, imageEmoji: "🍫", popular: true, prepTime: 3 },
  { name: "Bánh Mì KFC", description: "Bánh mì bơ xốp mềm, thơm ngậy, ăn kèm bữa chính hoặc tráng miệng.", category: "trang_miem", price: 15000, imageEmoji: "🍞", popular: false, prepTime: 2 },
  { name: "Khoai Tây Chiên Giòn", description: "Khoai tây chiên vàng giòn, rắc muối biển, chấm với sốt cà chua hoặc mayonnaise.", category: "trang_miem", price: 25000, imageEmoji: "🍟", popular: true, prepTime: 4 },
];

const demoAccounts = [
  { name: "Quản lý Demo", employeeId: "manager01", branch: "KFC Nhóm 17", role: "MANAGER" },
  { name: "Nhân viên Bếp", employeeId: "kitchen01", branch: "KFC Nhóm 17", role: "KITCHEN" },
  { name: "Thu Ngân", employeeId: "cashier01", branch: "KFC Nhóm 17", role: "CASHIER" },
];

async function main() {
  console.log("Seeding database...");

  await prisma.menuItem.deleteMany();
  for (const item of menuItems) {
    await prisma.menuItem.create({ data: { ...item, available: true } });
  }
  console.log(`✓ Created ${menuItems.length} menu items`);

  const pw = await bcrypt.hash("123456", 10);
  for (const acc of demoAccounts) {
    const exists = await prisma.employee.findUnique({ where: { employeeId: acc.employeeId } });
    if (!exists) {
      await prisma.employee.create({ data: { ...acc, password: pw } });
      console.log(`✓ Created account: ${acc.employeeId} (password: 123456)`);
    } else {
      console.log(`  Skipped existing account: ${acc.employeeId}`);
    }
  }

  console.log("\nDemo accounts (all use password: 123456):");
  console.log("  manager01 → Manager dashboard");
  console.log("  kitchen01 → Kitchen board");
  console.log("  cashier01 → Staff panel");
  console.log("\nStore code for registration: KFCNHOM17");
}

main().catch(console.error).finally(() => prisma.$disconnect());
