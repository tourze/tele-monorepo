import React, { memo } from 'react';
import { Image, StyleProp, ImageStyle, ImageSourcePropType } from "react-native";
import * as lowQualityFlag from "./flags/low/flagsIndex";

interface Props {
  isoCode: string;
  size: number;
  style?: StyleProp<ImageStyle>;
  quality?: "low" | "default";
}

interface FlagIndex {
  [key: string]: ImageSourcePropType;
}

const CountryFlag = ({ isoCode, size, style, quality = "default" }: Props) => {
  const flag = lowQualityFlag as FlagIndex;

  switch (isoCode.toLowerCase()) {
    case "in":
      return <Image source={flag["ind"]} style={[{ width: size * 1.6, height: size }, style]} />;

    case "do":
      return <Image source={flag["dom"]} style={[{ width: size * 1.6, height: size }, style]} />;

    default:
      return (
        <Image source={flag[isoCode.toLowerCase()]} style={[{ width: size * 1.6, height: size }, style]} />
      );
  }
};

export default memo(CountryFlag);
