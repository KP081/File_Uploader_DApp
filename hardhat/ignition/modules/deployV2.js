const { buildModule } = require("@nomicfoundation/ignition-core");

module.exports = buildModule("module" , (m) => {
    const fileUploaderV2 = m.contract("FileUploaderV2");

    return { fileUploaderV2 };
});