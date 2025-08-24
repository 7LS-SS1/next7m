// กันบางแพ็กเกจดึงจาก registry แปลก ๆ
module.exports = {
  hooks: {
    readPackage(pkg) {
      return pkg
    },
  },
}