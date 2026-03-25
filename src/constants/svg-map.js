/**
 * 카테고리명 → SVG 파일 매핑
 * import 시 Vite가 URL로 변환
 */
import padding from '../assets/clothes/padding.svg?raw';
import coat from '../assets/clothes/coat.svg?raw';
import jacket from '../assets/clothes/jacket.svg?raw';
import cardigan from '../assets/clothes/cardigan.svg?raw';
import windbreaker from '../assets/clothes/windbreaker.svg?raw';
import jumper from '../assets/clothes/jumper.svg?raw';
import shortSleeve from '../assets/clothes/short-sleeve.svg?raw';
import longSleeve from '../assets/clothes/long-sleeve.svg?raw';
import sweatshirt from '../assets/clothes/sweatshirt.svg?raw';
import hoodie from '../assets/clothes/hoodie.svg?raw';
import knit from '../assets/clothes/knit.svg?raw';
import shirt from '../assets/clothes/shirt.svg?raw';
import blouse from '../assets/clothes/blouse.svg?raw';
import jeans from '../assets/clothes/jeans.svg?raw';
import slacks from '../assets/clothes/slacks.svg?raw';
import chinos from '../assets/clothes/chinos.svg?raw';
import fleecePants from '../assets/clothes/fleece-pants.svg?raw';
import shorts from '../assets/clothes/shorts.svg?raw';
import skirt from '../assets/clothes/skirt.svg?raw';
import sneakers from '../assets/clothes/sneakers.svg?raw';
import dressShoes from '../assets/clothes/dress-shoes.svg?raw';
import boots from '../assets/clothes/boots.svg?raw';
import sandals from '../assets/clothes/sandals.svg?raw';
import slippers from '../assets/clothes/slippers.svg?raw';
import hat from '../assets/clothes/hat.svg?raw';
import scarf from '../assets/clothes/scarf.svg?raw';
import gloves from '../assets/clothes/gloves.svg?raw';
import umbrella from '../assets/clothes/umbrella.svg?raw';

/**
 * 카테고리명(한글) → SVG raw string 매핑
 * 사용: SVG_MAP['패딩'] → '<svg ...>...</svg>'
 * color 적용: CSS color 속성으로 currentColor 제어
 */
export const SVG_MAP = {
  // 아우터
  '패딩': padding,
  '코트': coat,
  '자켓': jacket,
  '가디건': cardigan,
  '바람막이': windbreaker,
  '점퍼': jumper,
  // 상의
  '반팔티': shortSleeve,
  '긴팔티': longSleeve,
  '맨투맨': sweatshirt,
  '후드': hoodie,
  '니트': knit,
  '셔츠': shirt,
  '블라우스': blouse,
  // 하의
  '청바지': jeans,
  '슬랙스': slacks,
  '면바지': chinos,
  '기모바지': fleecePants,
  '반바지': shorts,
  '치마': skirt,
  // 신발
  '운동화': sneakers,
  '구두': dressShoes,
  '부츠': boots,
  '샌들': sandals,
  '슬리퍼': slippers,
  // 액세서리
  '모자': hat,
  '목도리': scarf,
  '장갑': gloves,
  '우산': umbrella,
};
