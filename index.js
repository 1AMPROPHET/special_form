layui.use(['layer', 'form'], function () {
  var form = layui.form,
  $ = layui.jquery
  form.render()

  // 要保存的对象
  var setting = {}
  // 用来设置输入框绑定的数组
  var inputOrSelectList = ['set', 'query', 'xxx']
  //  验证数组
  var validateList = ['set', 'query', 'xxx', 'concatset', 'concatquery']
  // 拼接字符串的数组，可调整拼接顺序和拼接数量
  var concatList = ['set', 'query', 'xxx']
  // 拼接set的字符串数组
  var setArr = []
  // 拼接query的字符串数组
  var queryArr = []
  // 需要特殊处理的选项
  var specialParams = ['xxx']

  // 首先绑定
  bindMultiInput(inputOrSelectList)
  // 初始化拼接
  // concatValue(concatList)
  inputListener(inputOrSelectList)

  form.on('submit(submit)', function () {
    valiMultiInputOrSelect(validateList) && saveJSON(setting, 'setting.json')
    return false
  })

  // type选择
  form.on("select(type)", function(data) {
    if (data.value === 'set') {
      $('#queryInput').val('null')
      $('#setInput').val('')
    } else if (data.value === 'query') {
      $('#setInput').val('null')
      $('#queryInput').val('')
    } else {
      $('#setInput').val('')
      $('#queryInput').val('')
    }
    concatValue(concatList)
    setting.type = data.value
  })

  // 保存为json文件
  function saveJSON(data, filename) {
    if (!data) {
      alert('保存数据不能为空')
      return false
    }
    if (!filename) {
      filename = 'myFile.json'
    }
    if (typeof data === 'object') {
      data = JSON.stringify(data, undefined, 2)
    }
    var blob = new Blob([data], {type: 'text/json'})
    // var event = document.createEvent('MouseEvents')
    var a = document.createElement('a')
    a.download = filename
    a.href = window.URL.createObjectURL(blob)
    a.dataset.downloadurl = ['text/json', a.download, a.href].join(':')
    // event.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null)
    // a.dispatchEvent(event)
    a.click() // 并不是所有浏览器都支持所有元素click方法，只有button、input所有浏览器支持click
  }

  // 选择框绑定输入框
  function bindMultiInput(params) {
    params.forEach(param => {
      form.on(`select(${param})`, function (data) {
        $(`#${param}Input`).length && $(`#${param}Input`).val(data.value)
        concatValue(concatList)
      })
    })
  }

  // 验证函数
  function valiMultiInputOrSelect(params) {
    // 表示有一个验证不通过，则表单不会通过
    return params.every(param => {
      var paramInput = $(`#${param}Input`)
      if (paramInput.length) {

        setting[param] = paramInput.val() === 'null' ? null : paramInput.val().trim()
        return true

      } else {
        setting[param] = $(`#${param}Select`).val()
        return true
      }
    })
  }

  // 拼接字符串
  function concatValue(params) {
    setArr = []
    queryArr = []
    var type = $('#type').val(),
      concatSet = $('#concatsetInput'),
      concatQuery = $('#concatqueryInput')
    if (type === 'set') {
      getConcatArr(params, setArr)
      setArr.push('SET')
      // 首尾确定
      setArr.push('REQ')
      setArr.unshift('ID')
      // 拼接
      // $('#concatsetInput').val(setArr.join('_'))
      // $('#concatqueryInput').val('null')
      concatSet.val(setArr.join('_'))
      concatQuery.val('null')
    } else if (type === 'query') {
      getConcatArr(params, queryArr)
      queryArr.push('QRY')
      // 首尾确定
      queryArr.push('REQ')
      queryArr.unshift('ID')
      // 拼接
      concatQuery.val(queryArr.join('_'))
      concatSet.val('null')
    } else if (type === 'set&query') {
      getConcatArr(params, setArr, queryArr)
      queryArr.push('QRY')
      setArr.push('SET')
      // 首尾确定
      queryArr.push('REQ')
      setArr.push('REQ')
      queryArr.unshift('ID')
      setArr.unshift('ID')
      concatSet.val(setArr.join('_'))
      concatQuery.val(queryArr.join('_'))
    }
  }

  function getConcatArr(params, arr1, arr2 = null) {
    params.forEach(param => {
      var paramInput = $(`#${param}Input`)
      var paramSelect = $(`#${param}Select`)
      if (paramInput.length && paramInput.val().trim() != 'null') {
        if (specialParams.includes(param)) {
          var index = paramInput.val().trim().lastIndexOf('_')
          paramInput.val().trim() && arr1.push(paramInput.val().trim().toUpperCase().slice(index + 1))
          arr2 && paramInput.val().trim() && arr2.push(paramInput.val().trim().toUpperCase().slice(index + 1))
        } else {
          paramInput.val().trim() && arr1.push(paramInput.val().trim().toUpperCase())
          arr2 && paramInput.val().trim() && arr2.push(paramInput.val().trim().toUpperCase())
        }
      } else if (!paramInput.length && paramSelect.val().trim() != 'null') {
        if (specialParams.includes(param)) {
          var index = paramSelect.val().lastIndexOf('_')
          arr1.push(paramSelect.val().toUpperCase().slice(index + 1))
          arr2 && arr2.push(paramSelect.val().toUpperCase().slice(index + 1))
        } else {
          arr1.push(paramSelect.val().toUpperCase())
          arr2 && arr2.push(paramSelect.val().toUpperCase())
        }
      }
    })
  }

  // 监听输入选择框的输入绑定
  function inputListener(params) {
    const inputDebounce = debounce(
      () => concatValue(concatList),
      200
    )
    params.forEach(param => {
      $(`#${param}Input`).on('input', function (e) {
        // inputDebounce(e.target.value)
        inputDebounce()
      })
    })
  }

  // 防抖
  function debounce(func, time=200) {
    let timer = null
    return function (...args) {
      if (timer) {
        clearTimeout(timer)
      }
      timer = setTimeout(() => {
        func.apply(this, args)
      }, time)
    }
  }

  // 拼接最后一个下划线后的字符串
  // function lastUnderline(str) {
  //   const index = str.lastIndexOf('_') === -1 ? 0 : str.lastIndexOf('_')
  //   const subStr = str.subString(index)

  // }
})