const captchaColorMap = {
    '01': '红',
    '02': '黄',
    '03': '蓝'
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

const loadCaptchas = () => {
    let startTime = document.querySelector('#startTime').value;
    let endTime = document.querySelector('#endTime').value;
    const max = document.querySelector('#max').value;
    const color = document.querySelector('#color').value;
    const method = document.querySelector('#method').value;
    if (!startTime){
        document.querySelector('#startTime').value = startTime = moment().format('YYYY-MM-DD') + ' 00:00:00';
    }
    if (!endTime) {
        document.querySelector('#endTime').value = endTime = moment().format('YYYY-MM-DD') + ' 23:59:59';
    }
    const searchBtn = document.querySelector('#search');
    searchBtn.setAttribute('disabled', true);
    searchBtn.textContent = 'Searching';
    fetch(`/list?startTime=${startTime}&endTime=${endTime}&max=${max}&color=${color}&method=${method}`)
        .then(res => {
            searchBtn.textContent = 'Search';
            searchBtn.removeAttribute('disabled');
            return res;
        })
        .then(res => res.json())
        .then(data => render(data));
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

loadCaptchas();
