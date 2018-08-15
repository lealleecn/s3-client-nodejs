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
    let date = document.querySelector('#date').value;
    const max = document.querySelector('#max').value;
    const color = document.querySelector('#color').value;
    const method = document.querySelector('#method').value;
    if(!date){
        document.querySelector('#date').value = date = moment().format('YYYYMMDD');
    }
    fetch(`/list?date=${date}&max=${max}&color=${color}&method=${method}`).then(res => res.json()).then(data => render(data));
}

loadCaptchas();
