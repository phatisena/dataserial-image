
//%block="DataSerial"
//%color="#44d4ca"
//%icon="\uf187"
namespace dataserial {

    let cidk: { [key: string]: number } = {}

    //%block="$name"
    //%blockId=dataserial_indexkeyshadow
    //%blockHidden=true shim=TD_ID
    //%name.fieldEditor="autocomplete" name.fieldOptions.decompileLiterals=true
    //%name.fieldOptions.key="dataserialindexkey"
    export function _indexKeyShadow(name: string) {
        return name
    }

    //%blockid=dataserial_startindexkey
    //%block="set index in $name by $num"
    //%name.shadow="dataserial_indexkeyshadow" name.defl="myIdxKey"
    //%group="index key"
    //%weight=10
    export function setIdxKey(name: string, num: number) {
        cidk[name] = num
    }

    //%blockid=dataserial_getindexkey
    //%block="get $name from index key"
    //%name.shadow="dataserial_indexkeyshadow" name.defl="myIdxKey"
    //%group="index key"
    //%weight=5
    export function getIdxKey(name: string) {
        return cidk[name]
    }

    //%blockid=dataserial_writevalue
    //%block="write $strval"
    //%group="write and read"
    //%weight=10
    export function write(strval: string) {
        let oval = "", curc = ""
        for (let i = 0; i < strval.length; i++) {
            curc = strval.charAt(i)
            if ("\\|".includes(curc)) {
                oval = "" + oval + "\\"
            }
            oval = "" + oval + curc
        }
        oval = "" + oval + "|"
        return oval
    }

    //%blockid=dataserial_readvalue
    //%block="read $txt from idx key $name"
    //%name.shadow="dataserial_indexkeyshadow" name.defl="myIdxKey"
    //%group="write and read"
    //%weight=5
    export function read(txt: string, name: string) {
        if (cidk[name] == null) return "";
        let idx = cidk[name]
        let oval = "", curc = ""
        while (idx < txt.length) {
            curc = txt.charAt(idx)
            if ("|".includes(curc)) {
                break
            } else if ("\\".includes(curc)) {
                idx += 1
                curc = txt.charAt(idx)
            }
            oval = "" + oval + curc
            idx += 1
        }
        idx += 1, cidk[name] = idx
        return oval
    }

    function checkStrf2e(txt: string, fchr: string, lchr: string) {
        if (txt.substr(0, fchr.length) === fchr && txt.substr(Math.abs(txt.length - lchr.length), lchr.length) === lchr) return true;
        return false;
    }

    //%blockid=dataserial_savestrarray
    //%block="save string array $inputStrArr"
    //%group="array in string"
    //%weight=10
    export function saveStrArr(inputStrArr: string[]) {
        let outputStr = ""
        outputStr = "" + outputStr + write("[str<")
        let cval = ""
        let count = 1
        for (let val of inputStrArr) {
            if (cval.isEmpty()) {
                cval = val
            } else {
                if (cval == val) {
                    count += 1
                } else {
                    outputStr = "" + outputStr + write(count.toString())
                    outputStr = "" + outputStr + write(cval)
                    cval = val
                    count = 1
                }
            }
        }
        outputStr = "" + outputStr + write(count.toString())
        outputStr = "" + outputStr + write(cval)
        outputStr = "" + outputStr + write(">str]")
        return outputStr
    }

    //%blockid=dataserial_loadstrarray
    //%block="load string array $inputStr"
    //%group="array in string"
    //%weight=8
    export function loadStrArr(inputStr: string) {
        let outputStrArr: string[] = []
        setIdxKey("_StrArrData", 0)
        let val = read(inputStr, "_StrArrData")
        if (!(checkStrf2e(val, "[", "<"))) return [];
        let count = 0, countstr = ""
        while (getIdxKey("_StrArrData") < inputStr.length) {
            if (count <= 0) {
                countstr = read(inputStr, "_StrArrData")
                if (checkStrf2e(countstr, ">", "]")) break;
                count = parseInt(countstr)
                val = read(inputStr, "_StrArrData")
            }
            while (count > 0) {
                count -= 1
                outputStrArr.push(val)
            }
        }
        return outputStrArr
    }

    //%blockid=dataserial_savestrtablearray
    //%block="save string table array $inputStrArr"
    //%inputStrArr.shadow=variables_get inputStrArr.defl=StringTableArray
    //%group="array in string"
    //%weight=6
    export function saveStrTableArr(inputStrArr: string[][]) {
        let outputStr = ""
        outputStr = "" + outputStr + write("[str<")
        let cval = ""
        let count = 1, nv = 0
        for (let n = 0; n < inputStrArr.length; n++) {
            for (let val of inputStrArr[n]) {
                if (cval.isEmpty()) {
                    cval = val
                } else {
                    if (cval == val) {
                        count += 1
                    } else if (n !== nv) { nv = n; count = 1; cval = val } else {
                        outputStr = "" + outputStr + write(count.toString())
                        outputStr = "" + outputStr + write(cval)
                        cval = val
                        count = 1
                    }
                }
            }
            outputStr = "" + outputStr + write(count.toString())
            outputStr = "" + outputStr + write(cval)
            if (n < inputStrArr.length - 1) outputStr = "" + outputStr + write(">]str[<");
        }
        outputStr = "" + outputStr + write(">str]")
        return outputStr
    }

    //%blockid=dataserial_loadstrarray
    //%block="load string table array $inputStr"
    //%group="array in string"
    //%weight=4
    export function loadStrTableArr(inputStr: string) {
        let outputStrArr: string[][] = []
        setIdxKey("_StrArrData", 0)
        let val = read(inputStr, "_StrArrData")
        if (!(checkStrf2e(val, "[", "<"))) return [];
        outputStrArr.push([])
        let count = 0, countstr = "", cidx = outputStrArr.length - 1
        while (getIdxKey("_StrArrData") < inputStr.length) {
            if (count <= 0) {
                countstr = read(inputStr, "_StrArrData")
                if (checkStrf2e(countstr, ">]", "[<")) {
                    outputStrArr.push([])
                    cidx = outputStrArr.length - 1
                } else if (checkStrf2e(countstr, ">", "]")) { break; } else {
                    count = parseInt(countstr)
                    val = read(inputStr, "_StrArrData")
                }
            }
            while (count > 0) {
                count -= 1
                outputStrArr[cidx].push(val)
            }
        }
        return outputStrArr
    }

    //%blockid=dataserial_saveimage
    //%block="save image $InputImg=screen_image_picker to string data"
    //%group="image serial"
    //%weight=10
    export function saveImg(InputImg: Image) {
        let OutputStr = ""
        OutputStr = "" + OutputStr + write("image")
        OutputStr = "" + OutputStr + write("img.1")
        OutputStr = "" + OutputStr + write(convertToText(InputImg.width))
        OutputStr = "" + OutputStr + write(convertToText(InputImg.height))
        let NumVal = InputImg.getPixel(0, 0), Count = 1, Ix = 0, Iy = 0
        for (let index = 0; index <= InputImg.width * InputImg.height - 2; index++) {
            Ix = (index + 1) % InputImg.width, Iy = Math.floor((index + 1) / InputImg.width)
            if (NumVal == InputImg.getPixel(Ix, Iy)) {
                Count += 1
            } else {
                OutputStr = "" + OutputStr + write(convertToText(Count)), OutputStr = "" + OutputStr + write(convertToText(NumVal))
                NumVal = InputImg.getPixel(Ix, Iy), Count = 1
            }
        }
        OutputStr = "" + OutputStr + write(convertToText(Count)), OutputStr = "" + OutputStr + write(convertToText(NumVal)), OutputStr = "" + OutputStr + write("ENDimg")
        return OutputStr
    }

    //%blockid=dataserial_loadimage
    //%block="load image $DataStr from string data"
    //%group="image serial"
    //%weight=5
    export function loadImg(DataStr: string) {
        if (DataStr.isEmpty()) return undefined;
        setIdxKey("_ImgData", 0)
        let StrVal = read(DataStr, "_ImgData")
        let NumVal = 0, Ix = 0, Iy = 0
        if (!(StrVal.includes("image"))) return undefined;
        StrVal = read(DataStr, "_ImgData")
        if (!(StrVal.includes("img."))) return undefined;
        let Widt = parseInt(read(DataStr, "_ImgData")), Heig = parseInt(read(DataStr, "_ImgData"))
        let OutputImg = image.create(Widt, Heig)
        let I = 0, CountStr = read(DataStr, "_ImgData"), Count = parseInt(CountStr)
        while (getIdxKey("_ImgData") < DataStr.length) {
            Ix = I % Widt
            Iy = Math.floor(I / Widt)
            NumVal = parseInt(read(DataStr, "_ImgData"))
            for (let index = 0; index < Count; index++) {
                OutputImg.setPixel(Ix, Iy, NumVal)
                I += 1
                Ix = I % Widt
                Iy = Math.floor(I / Widt)
            }
            CountStr = read(DataStr, "_ImgData")
            if (CountStr.includes("END")) break;
            Count = parseInt(CountStr)
        }
        return OutputImg
    }

    //%blockid=dataserial_saveimagearray
    //%block="save image array $InputImgArr to string data"
    //%InputImgArr.shadow=lists_create_with InputImgArr.defl=screen_image_picker
    //%group="image serial array"
    //%weight=10
    export function saveImgArray(InputImgArr: Image[]) {
        let OutputStr = ""
        OutputStr = "" + OutputStr + write("imagearr")
        OutputStr = "" + OutputStr + write("imgarr.1")
        let I = 0, NumVal = 0, Count = 0, Ix = 0, Iy = 0
        for (let value of InputImgArr) {
            OutputStr = "" + OutputStr + write(convertToText(value.width))
            OutputStr = "" + OutputStr + write(convertToText(value.height))
            NumVal = value.getPixel(0, 0)
            Count = 1
            for (let index = 0; index <= value.width * value.height - 2; index++) {
                Ix = (index + 1) % value.width
                Iy = Math.floor((index + 1) / value.width)
                if (NumVal == value.getPixel(Ix, Iy)) {
                    Count += 1
                } else {
                    OutputStr = "" + OutputStr + write(convertToText(Count))
                    OutputStr = "" + OutputStr + write(convertToText(NumVal))
                    NumVal = value.getPixel(Ix, Iy)
                    Count = 1
                }
            }
            OutputStr = "" + OutputStr + write(convertToText(Count))
            OutputStr = "" + OutputStr + write(convertToText(NumVal))
            if (I < InputImgArr.length - 1) {
                OutputStr = "" + OutputStr + write("NEXTimgarr")
            }
            I += 1
        }
        OutputStr = "" + OutputStr + write("ENDimgarr")
        return OutputStr
    }

    //%blockid=dataserial_loadimagearray
    //%block="load image array $DataStr from string data"
    //%group="image serial array"
    //%weight=5
    export function loadImgArray(DataStr: string) {
        setIdxKey("ImgData", 0)
        let StrVal = read(DataStr, "ImgData")
        if (!(StrVal.includes("imagearr"))) return [];
        StrVal = read(DataStr, "ImgData")
        if (!(StrVal.includes("imgarr."))) return [];
        let OutputImgArr: Image[] = []
        let Widt = parseInt(read(DataStr, "ImgData")), Heig = parseInt(read(DataStr, "ImgData"))
        let OutputImg = image.create(Widt, Heig)
        let I = 0, Ix = 0, Iy = 0, NumVal = 0, CountStr = read(DataStr, "ImgData"), Count = parseInt(CountStr)
        while (getIdxKey("ImgData") < DataStr.length) {
            Ix = I % Widt
            Iy = Math.floor(I / Widt)
            NumVal = parseInt(read(DataStr, "ImgData"))
            for (let index = 0; index < Count; index++) {
                OutputImg.setPixel(Ix, Iy, NumVal)
                I += 1
                Ix = I % Widt
                Iy = Math.floor(I / Widt)
            }
            CountStr = read(DataStr, "ImgData")
            if (CountStr.includes("END")) {
                break;
            } else if (CountStr.includes("NEXT")) {
                OutputImgArr.push(OutputImg.clone())
                Widt = parseInt(read(DataStr, "ImgData"))
                Heig = parseInt(read(DataStr, "ImgData"))
                CountStr = read(DataStr, "ImgData")
                I = 0
                OutputImg = image.create(Widt, Heig)
            }
            Count = parseInt(CountStr)
        }
        return OutputImgArr
    }
}
