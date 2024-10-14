import { Dimensions } from "react-native";

const {width, height} = Dimensions.get('screen');

export const COLORS = {
    primary: '#2E6F40',
    title: 'darkgrey',
};

export const SIZES = {
    h1: 22,
    h2: 20,
    h3: 18,
    h4: 16,
    h5: 14,
    h6: 12,

    width,
    height,
}