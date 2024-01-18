/** @type {import('fonzi2').Config} */
module.exports = {
  logger: {
    enabled: true,
    levels: "all",
    remote: {
      enabled: true,
      levels: "all"
    },
    file: {
      enabled: false,
      levels: "all",
      path: "logs/"
    }
  }
}