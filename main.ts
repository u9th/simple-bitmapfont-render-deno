import { Image, decode } from "https://deno.land/x/imagescript@v1.2.14/mod.ts"

type CharCodeMap = { [str: string]: number }
interface CharCodes extends Array<number> {
  [index: number]: number
}

const INPUT_BITMAP_IMGPATH = "bitmapfont5a.png"
const INPUT_BITMAP_MAPPINGTXT = "bitmap.txt" //このテキスト内のスペースや改行は無視されるはずなので、ビットマップ画像に穴開きの部分がある場合は、テキスト側はそこを適当な使わない文字で埋める必要があると思う
const OUTPUT_FILEPATH = "out.png"
const OUTPUT_BASE_WIDTH = 200
const OUTPUT_BASE_HEIGHT = 200
const OUTPUT_RESIZE_MULTIPLY = 2
const OUTPUT_TEXT = `
　　　　゛
とりあえす
　　　　　
てきとうにつくってみた

　　　゛
いままてふぉんとつくったことないし
゛　　　　　　　゛　　　　　　　゛
とっとえもほとんとしたことないけと
　　　　゜　　　　　　　　　　　゛
5かけ5ひくせるふぉんとちゃれんしってのやってたから
　　゛　゛　゛　゛
ひらかなたけたけとつくってみた
　　　　　　゛゛゛　　　　　　　゜　゛
このふぉんとてかそうせいせいするふろくらむつくってみたら
　　　　　゛　　　　　　　　　　　　　　　　　　　　゛
いろいろなふんしょうをにゅうりょくしてせいせいするのかたのしかった
　゛　　　　゛
のてよかったてす

　　　　　　　　　　゛
ゆにてぃ１うぃーくにけーむつくるのまにあわせるの
　　　　　　　　　
あきらめたよ～（そのうちかんせいさせたいね…）　
`
const BITMAP_IMG = (await decode(await Deno.readFile(INPUT_BITMAP_IMGPATH))) as Image
const BITMAP_CHAR_WIDTH = 5
const BITMAP_CHAR_X_SP = 1
const BITMAP_CHAR_HEIGHT = 5
const BITMAP_CHAR_Y_SP = 1
const BITMAP_IMG_W = 60
const RENDER_LINE_HEIGHT = 6
const RENDER_CHAR_WIDTH = 6

const BITMAP_CHAR_WIDTH_INCLUDE_SP = BITMAP_CHAR_WIDTH + BITMAP_CHAR_X_SP
const BITMAP_CHAR_HEIGHT_INCLUDE_SP = BITMAP_CHAR_HEIGHT + BITMAP_CHAR_Y_SP
const BITMAP_CHAR_X_COUNT = Math.floor(BITMAP_IMG_W / BITMAP_CHAR_WIDTH_INCLUDE_SP)
const BITMAP_CODE_MAP: CharCodeMap = stringToCharCodeMap(await Deno.readTextFile(INPUT_BITMAP_MAPPINGTXT))

//const bitmaps = toMultiLineBitmapCodes(outputText)
//console.log(bitmaps)

///const outputImg = renderText(new Image(200, 200), OUTPUT_TEXT)
await Deno.writeFile(OUTPUT_FILEPATH, await generateImgFile(OUTPUT_BASE_WIDTH, OUTPUT_BASE_HEIGHT, OUTPUT_TEXT))
console.log("finished!")

function generateImgFile(width: number, height: number, text: string) {
  const outputImg = renderText(new Image(width, height), text)
  return outputImg
    .resize(
      outputImg.width * OUTPUT_RESIZE_MULTIPLY,
      outputImg.height * OUTPUT_RESIZE_MULTIPLY,
      Image.RESIZE_NEAREST_NEIGHBOR
    )
    .encode()
}

function renderText(img: Image, text: string) {
  const bitmapCodesLines = stringToMultiLineCharCodes(text)
  for (let ln = 0; ln < bitmapCodesLines.length; ln++) {
    const bitmapCodes = bitmapCodesLines[ln]
    for (let i = 0; i < bitmapCodes.length; i++) {
      const strImg = getCharImgFromCharCode(bitmapCodes[i])
      img.composite(strImg, i * RENDER_CHAR_WIDTH, ln * RENDER_LINE_HEIGHT)
    }
  }
  return img
}

function stringToCharCodeMap(bitmapText: string) {
  const strings = bitmapText.split("\n").flatMap((n) => n.trim().split(""))
  const codeMap: CharCodeMap = {}
  for (let i = 0; i < strings.length; i++) {
    if (isHankakuChar(strings[i])) {
      const zenkaku = hankakuToZenkaku(strings[i])
      codeMap[zenkaku] = i
    }
    codeMap[strings[i]] = i
  }
  return codeMap
}

function getCharImgFromCharCode(code: number) {
  const x = code % BITMAP_CHAR_X_COUNT
  const y = Math.floor(code / BITMAP_CHAR_X_COUNT)
  return BITMAP_IMG.clone().crop(
    x * BITMAP_CHAR_WIDTH_INCLUDE_SP,
    y * BITMAP_CHAR_HEIGHT_INCLUDE_SP,
    BITMAP_CHAR_WIDTH,
    BITMAP_CHAR_HEIGHT
  )
}

function stringToCharCodes(strs: string) {
  const strings = strs.split("")
  const bitmapCodes: CharCodes = []
  for (let i = 0; i < strings.length; i++) {
    bitmapCodes[i] = BITMAP_CODE_MAP[strings[i]] ?? -1
  }

  return bitmapCodes
}

function stringToMultiLineCharCodes(strs: string) {
  const lines = strs.split("\n")
  const output: CharCodes[] = []
  for (let i = 0; i < lines.length; i++) {
    output[i] = stringToCharCodes(lines[i])
  }
  return output
}

function isHankakuChar(str: string) {
  return str.match(/[A-Za-z0-9]/g) != null
}

function hankakuToZenkaku(str: string) {
  return str.replace(/[A-Za-z0-9]/g, function (s) {
    return String.fromCharCode(s.charCodeAt(0) + 0xfee0)
  })
}
