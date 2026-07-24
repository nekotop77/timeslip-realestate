import { prisma } from "../lib/db.js";
import { LAWD_CODES } from "./data/lawdCodes.js";

async function main() {
  for (const region of LAWD_CODES) {
    await prisma.region.upsert({
      where: { lawdCd: region.lawdCd },
      update: { sido: region.sido, sigungu: region.sigungu, label: region.label },
      create: region,
    });
  }
  console.log(`Region 시드 완료: ${LAWD_CODES.length}개 법정동코드 매핑`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
