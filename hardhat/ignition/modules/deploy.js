const { buildModule } = require("@nomicfoundation/ignition-core");

module.exports = buildModule("module" , (m) => {
    const fileUploader = m.contract("FileUploader");

    return { fileUploader };
});