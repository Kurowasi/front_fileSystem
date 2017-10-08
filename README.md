# front_fileSystem
HTML5のFileSytem APIを使いやすくできる感じ


# usage

```js
let fs = new FileSystem();  
fs.writeFile();
```

## FileSystem()
第一引数：obj　設定オブジェクト

```js
obj = {
    fileSize: 'ファイルサイズ',
    type: 'タイプ',
    path: '作成するファイルのパス',
    options: 'ファイルを作成する際の設定',
}
```

## writeFile()
第一引数： blob ファイルに記述するblobオブジェクト
第二引数： Function 成功した時に呼ばれるコールバック関数
第三引数： Function 失敗した時に呼ばれるコールバック関数