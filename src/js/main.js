//일반 브라우저들은 해석할 수 없음
//일반적인 자바스크립트 환경에서 동작하지 않음
import { random } from "./util";

const rOne = random(10);
const rTwo = random(20);

console.log(`${rOne} ${rTwo}`);