// utils/getInfo.js
const getInfoOptions = (alias = 'Info') => {
  return [
    {
      model: Info,
      as: alias,
    },
  ];
};

module.exports = getInfoOptions;
