/**
 * FileSystemを使いやすくするコンストラクタ関数
 * 
 * @class FileSystem
 * @constructor
 */
let FileSystem = function(obj) {
    /**
     * ファイルエントリを格納
     * 
     * @property fileEntry
     * @type {fileEntry}
     */
    this.fileEntry;
    /**
     * ファイルサイズを格納
     * 
     * @property fileSize
     * @type {int}
     * @default 1024 * 1024
     */
    this.fileSize = 1024 * 1024;
    /**
     * タイプを格納
     * 
     * @property type
     * @type {int}
     * @default window.TEMPORARY
     */
    this.type = window.TEMPORARY;
    /**
     * 作成するファイルへのパス
     * 
     * @property path
     * @type {String}
     * @default log.txt
     */
    this.path = 'log.txt';
    /**
     * ファイルを作成する際の設定
     * 
     * @property options
     * @type {Object}
     * @default {create: true}
     */
    this.options = {create: true};
    /**
     * 記述するファイルの中身
     * 
     * @property blob
     * @type {Blob}
     * @default Blob()
     */
    this.blob = new Blob();
    /**
     * jsonに追加するオブジェクトを格納
     * 
     * @property json
     * @type {obj}
     * @default {}
     */
    this.json = {};
    /**
     * 書き込みが成功した際のコールバック関数
     * 
     * @property onwriteend
     * @type {Function}
     * @default function() { console.log('書き込み成功') }
     */
    this.onwriteend = function() { console.log('書き込み成功') };
    /**
     * 書き込みが失敗した際のコールバック関数
     * 
     * @property onerror
     * @type {Function}
     * @default function() { console.log('書き込み失敗') }
     */
    this.onerror = function() { console.log('書き込み失敗') };
    /**
     * 読み込みが成功した際のコールバック関数
     * 
     * @property onloadend
     * @type {Function}
     * @default function() { console.log('読み込み成功：' + this.result)};
     */
    this.onloadend = function() { console.log('読み込み成功：' + this.result)};

    this.init(obj);

    window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;
    (async function() {
        let rq = await this.requestQuota(this.fileSize);
        let rfs = await this.requestFileSystem(this.type, rq);
        this.fileEntry = await this.getFile(rfs, this.path, this.options);
    }).call(this);
};

/**
 * 現在書き込み中かのフラグ
 * 
 * @property writingFlag
 * @type Boolean
 * @default true
 */
this.FileSystem.writingFlag = true;

/**
 * 初期化を行う
 * 
 * @method init
 * @param {object} 初期化するためのプロパティを持つ
 */
FileSystem.prototype.init = function(obj) {
    for (key in obj) {
        switch (key) {
            case 'fileSize':
                this.fileSize = obj[key];
                break;
            case 'type':
                this.type = obj[key];
                break;
            case 'path':
                this.path = obj[key];
                break;
            case 'options':
                this.options = obj[key];
                break;
            default:
                console.log(key + 'プロパティは存在しません');
                break;
        }
    }
};

/**
 * ファイルの中身を取得
 * 
 * @method readFile
 * @param {Function} 成功した時に呼ばれるコールバック関数
 */
FileSystem.prototype.readFile = function(success) {
    if (success) this.onloadend = success;

    let timer = setInterval(function(that) {
        if (that.fileEntry) {
            clearInterval(timer);
            (async function() {
                let grf = await this.getReadFile(that.fileEntry);
                let reader = new FileReader();
                reader.onloadend = this.onloadend;
                reader.readAsText(grf);
            }).call(that);
        }
    }, 1, this);
}

/**
 * 書き込みを行う
 * 
 * @method writeFile
 * @param {blob} ファイルに記述するblobオブジェクト
 * @param {Function} 成功した時に呼ばれるコールバック関数
 * @param {Function} 失敗した時に呼ばれるコールバック関数
 */
FileSystem.prototype.writeFile = function(blob, onwriteend, onerror) {
    if (blob) this.blob = blob;
    if (onwriteend) this.onwriteend = onwriteend;
    if (onerror) this.onerror = onerror;

    let timer = setInterval(function(that) {
        if (that.fileEntry) {
            clearInterval(timer);
            (async function() {
                let cw = await that.createWriter(this.fileEntry);
                await that.truncateFile(cw);
                cw.onwriteend = this.onwriteend;
                cw.onerror = this.onerror;
                cw.write(this.blob);
            }).call(that);
        }
    }, 1, this);
};

/**
 * 上書きを行う
 * 
 * @method overwriteFile
 * @param {blob} ファイルに記述するblobオブジェクト
 * @param {Function} 成功した時に呼ばれるコールバック関数
 * @param {Function} 失敗した時に呼ばれるコールバック関数
 */
FileSystem.prototype.overwriteFile = function(blob, onwriteend, onerror) {
    if (blob) this.blob = blob;
    if (onwriteend) this.onwriteend = onwriteend;
    if (onerror) this.onerror = onerror;

    let timer = setInterval(function(that) {
        if (that.fileEntry) {
            clearInterval(timer);
            (async function() {
                let cw = await that.createWriter(this.fileEntry);
                cw.seek(cw.length);
                cw.onwriteend = this.onwriteend;
                cw.onerror = this.onerror;
                cw.write(this.blob);
            }).call(that);
        }
    }, 1, this);
};

/**
 * jsonファイルにオブジェクトを追加する
 * 
 * @method jsonAddFile
 * @param {obj} jsonファイルに追加するオブジェクト
 * @param {Function} 成功した時に呼ばれるコールバック関数
 * @param {Function} 失敗した時に呼ばれるコールバック関数
 */
FileSystem.prototype.jsonAddFile = function(json, onwriteend, onerror) {
    if (json) this.json = json;
    if (onwriteend) this.onwriteend = onwriteend;
    if (onerror) this.onerror = onerror;

    let timer = setInterval(function(that) {
        if (that.fileEntry && FileSystem.writingFlag) {
            FileSystem.writingFlag = false;
            clearInterval(timer);
            (async function() {
                let grf = await this.getReadFile(that.fileEntry);
                let reader = new FileReader();
                reader.onloadend = function(data) {
                    (async function() {
                        let cw = await that.createWriter(this.fileEntry);
                        await that.truncateFile(cw);
                        cw.onwriteend = function() {
                            FileSystem.writingFlag = true;
                            console.log('書き込み成功');
                        };
                        cw.onerror = this.onerror;

                        let resultJson = [];
                        let resultBlob;
                        if (data.target.result !== '') {
                            resultJson = JSON.parse(data.target.result);
                        }
                        if (json) resultJson.push(json);
                        resultBlob = new Blob([JSON.stringify(resultJson, null, 4)], {type: 'application/json'});
                        cw.write(resultBlob);
                    }).call(this);
                }.bind(this);
                reader.readAsText(grf);
            }).call(that);
        }
    }, 1, this);
};

/**
 * requestQuotaを呼ぶPromise
 * 
 * @method requestQuota
 * @param {int} ファイルサイズ
 * @return {Promise} プロミスオブジェクトを返す
 */
FileSystem.prototype.requestQuota = function(fileSize) {
    return new Promise((resolve, reject) => {
        navigator.webkitTemporaryStorage.requestQuota(fileSize, resolve, reject);
    });
};

/**
 * requestFileSystemを呼ぶプロミス
 * 
 * @method requestFyleSystem
 * @param {int} 定数
 * @param {int} requestQuotaの戻り値
 * @return {Promise} プロミスオブジェクトを返す
 */
FileSystem.prototype.requestFileSystem = function(type, bytes) {
    return new Promise((resolve, reject) => {
        window.requestFileSystem(type, bytes, resolve, reject);
    });
};

/**
 * getFileを呼ぶプロミス
 * 
 * @method getFile
 * @param {FileSystem} requestFileSystemの戻り値
 * @param {String} 作成するファイルのパス
 * @param {object} 設定プロパティ
 * @return {Promise} プロミスオブジェクトを返す
 */
FileSystem.prototype.getFile = function(fs, path, options) {
    return new Promise((resolve, reject) => {
        fs.root.getFile(path, options, resolve, reject);
    });
};

/**
 * createWriterを呼ぶプロミス
 * 
 * @method createWriter
 * @param {FileWriter} getFileの戻り値
 * @return {Promise} プロミスオブジェクトを返す
 */
FileSystem.prototype.createWriter = function(fileWriter) {
    return new Promise((resolve, reject) => {
        fileWriter.createWriter(resolve, reject);
    });
};

/**
 * fileを呼ぶプロミス
 * 
 * @method getReadFile
 * @param {FileEntry} getFIleの戻り値
 * @return {Promise} プロミスオブジェクトを返す
 */
FileSystem.prototype.getReadFile = function(fileEntry) {
    return new Promise((resolve, reject) => {
        fileEntry.file(resolve, reject);
    });
};

/**
 *  truncateを呼ぶプロミス
 * 
 * @method truncateFile
 * @param {FileWriter} getFileの戻り値
 * @return {Promise} プロミスオブジェクトを返す
 */
FileSystem.prototype.truncateFile = function(fileWriter) {
    return new Promise((resolve, reject) => {
        fileWriter.onwriteend = resolve;
        fileWriter.onerror = reject;
        fileWriter.truncate(0);
    });
};

/**
 * エラーハンドラ
 * 
 * @method errorHandle
 */
FileSystem.prototype.errorHandle = function(e) {
    console.log(e);
};