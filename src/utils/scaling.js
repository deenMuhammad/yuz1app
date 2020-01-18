import {Dimensions} from 'react-native';
const {width, height} = Dimensions.get('window');

//Guideline sizes are based on standard ~5" screen mobile device
const guidelineBaseWidth = 350;
const guidelineBaseHeight = 680;

const scale = size => (width / guidelineBaseWidth) * size;
const temp = size => (height / guidelineBaseHeight) * size;
const normalize = (size, factor = 0.5) => size + (scale(size) - size) * factor;
const textDotting = (text, length = 5) => {
  if (text.length > length) {
    return text.slice(0, length) + '...';
  } else {
    return text;
  }
};
const numberWithCommas = x => {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};
const numberWithoutCommas = text => {
  var num_array = text.split(',');
  return num_array.join('');
};

export {
  scale,
  normalize,
  temp,
  textDotting,
  numberWithCommas,
  numberWithoutCommas,
};
