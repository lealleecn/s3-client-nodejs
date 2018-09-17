const captchaColorMap = {
    '': 'ALL',
    '01': 'Red',
    '02': 'Yellow',
    '03': 'Blue'
};

const captchaTable = items => {
    return (
        <div>
            <p>
                total: {items.length}
            </p>
            <table className="captcha-table">
                <thead>
                    <tr>
                        <th>captcha</th>
                        <th>color</th>
                        <th>result</th>
                        <th>method</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        getCapthaLines(items)
                    }
                </tbody>
            </table>
        </div>
    );
}

const getCapthaLines = items => items.map(item => {
    return (
        <tr>
            <td><img src={'data:image/png;base64,'+item.captcha} /></td>
            <td>{captchaColorMap[item.color]}</td>
            <td>{item.result}</td>
            <td>{item.decodeMethod}</td>
        </tr>
    )
});

const render = items => {
    ReactDOM.render(
        captchaTable(items),
        document.querySelector('#root')
    );
}

const getSeachQuerys = () => ({
    startTime: document.querySelector('#startTime').value,
    endTime: document.querySelector('#endTime').value,
    max: document.querySelector('#max').value,
    color: document.querySelector('#color').value,
    method: document.querySelector('#method').value,
    result: document.querySelector('#result').value,
    hasChinese: document.querySelector('#hasChinese').value,
    resultLength: document.querySelector('#resultLength').value
})

const loadCaptchas = () => {
    let { startTime, endTime, max, color, method, result, hasChinese, resultLength } = getSeachQuerys();
    if (!startTime) {
        document.querySelector('#startTime').value = startTime = moment().format('YYYY-MM-DD') + ' 00:00:00';
    }
    if (!endTime) {
        document.querySelector('#endTime').value = endTime = moment().format('YYYY-MM-DD') + ' 23:59:59';
    }
    const searchBtn = document.querySelector('#search');
    searchBtn.setAttribute('disabled', true);
    searchBtn.textContent = 'Searching';
    window.captchaData = null;
    fetch(`/list?startTime=${startTime}&endTime=${endTime}&max=${max}&color=${color}&method=${method}&result=${result}&hasChinese=${hasChinese}&resultLength=${resultLength}`)
        .then(res => {
            searchBtn.textContent = 'Search';
            searchBtn.removeAttribute('disabled');
            return res;
        })
        .then(res => res.json())
        .then(data => {
            window.captchaData = data;
            render(data);
        });
}

const syncData = () => {
    if(window.confirm('确定吗？')){
        const syncDataBtn = document.querySelector('#syncData');
        syncDataBtn.setAttribute('disabled', true);
        syncDataBtn.textContent = 'Syncing';
        fetch('/syncdata')
            .then(res => {
                syncDataBtn.textContent = 'Sync Data';
                syncDataBtn.removeAttribute('disabled');
                return res;
            })
            .then(res => res.json())
            .then(data => {
                alert(JSON.stringify(data, null, 2));
            })
            .catch(error => {
                alert(JSON.stringify(error))
            });
    }
}

const dataURLtoFile = (dataurl, filename) => {
    var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
}

const getFileName = item => `${captchaColorMap[item.color]}-${item.result}-${item.id}.png`;

const downloadImages = () => {
    if (window.captchaData){
        const { startTime, endTime, max, color, method, result, hasChinese, resultLength } = getSeachQuerys();
        const zip = new JSZip();
        window.captchaData.forEach(item => {
            const fileName = getFileName(item);
            zip.file(fileName, dataURLtoFile(`data:image/png;base64,${item.captcha}`, fileName));
        });

        zip.generateAsync({ type: 'blob' }).then(blob => { 
            saveAs(blob, `[color:${captchaColorMap[color]}]-[hasChinese:${hasChinese}]-[method:${method}]-[result:${result}]-[resultLength:${resultLength}]-[total:${captchaData.length}].zip`);                          
        }, function (err) {
            console.error(err);
            alert('error, check console error');
        });
    } else {
        alert('there is no displayed capthca')
    }
}

loadCaptchas();
