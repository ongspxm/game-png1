const game = {
    done: false,
    rightCnt: 0,
    wrongCnt: 0,
    timerCurr: 0,
    timerMul: 1.0,
    timerMax: 1000*60*2,
    flashTime: 250,
};

// === UTIL FUNCS ===
function $(idName) {
    return document.getElementById(idName);
}

function $$(className) {
    const ele = document.createElement('div');
    ele.className = className;
    return ele;
}

function show(idName) {
    const eles = document.getElementsByClassName('layout');
    for (let i=0; i<eles.length; i++) {
        eles[i].style.display = 'none';
    }

    $(idName).style.display = 'block';
}

function getTime() {
    return (new Date()).getTime();
}

function resetClass(ele) {
    ele.className = '';
}

// === DATA FUNCS ===
function random() {
    return [1,2,3,4].sort(() => Math.random() - 0.5);
}

function pattern(n, sort=true) {
    const states = [];

    for (let i=0; i<n-1; i++) {
        states.push(0);
    }
    states.push(1);

    return sort ? states.sort(() => Math.random()>0.5) : states;
}

// === ALGO FUNCS ===
function setup(n) {
    const arrs = [];
    for(let j=0; j<n; j++) {
        arrs.push(random());
    }

    return arrs;
}

function swap(orig, position) {
    const aftr = [0, 0, 0, 0];
    for (let i=0; i<position.length; i++) {
        aftr[i] = orig[position[i]-1];
    }
    return aftr;
}

function getVal(arrs, init) {
    for (let i=0; i<arrs.length; i++) {
        init = swap(init, arrs[i]);
    }
    return init;
}

// === ENGI FUNCS ===
function correct() {
    game.rightCnt += 1;
    game.timerMul *= 1.1;

    if (game.rightCnt % 5 == 0) {
        game.timerMul *= 0.75;
    }

    const body = document.body;
    body.className = 'correct';
    setTimeout(() => resetClass(body), game.flashTime);

    refresh();
}

function wrong() {
    game.wrongCnt += 1;
    game.timerMul *= 0.5;

    const body = document.body;
    body.className = 'wrong';
    setTimeout(() => resetClass(body), game.flashTime);

    refresh();
}

function drawScore() {
    $('score-1').innerHTML = game.rightCnt;
    $('score-correct').innerHTML = game.rightCnt;

    $('score-2').innerHTML = game.rightCnt + game.wrongCnt;
    $('score-total').innerHTML = game.rightCnt + game.wrongCnt;
}

function timeout() {
    drawScore();
    show('timeout');
}

function getTimeLimit() {
    game.timerMul = Math.min(game.timerMul, 1.0);
    return game.timerMax * game.timerMul;
}

// === GAME FUNCS ===
function start() {
    show('display');

    refresh();
    update();
}

function refresh() {
    drawScore();
    game.timerCurr = getTime() + getTimeLimit();

    // NOTE: game difficulty level
    const layerCnt = 2 + parseInt(Math.random() * game.rightCnt/5);
    const toMix = game.rightCnt > 3;

    const init = random();
    const arrs = setup(layerCnt);
    const patt = pattern(layerCnt, toMix);

    const rows = [];

    const shape1 = $$('shapes');
    for (let i=0; i<init.length; i+=1) {
        const shape = $$('shape' + init[i]);
        shape1.appendChild(shape);
    }
    rows.push(shape1);

    for (let i=0; i<arrs.length; i+=1) {
        if (patt[i] == 0) {
            const state = $$('state');
            state.innerText = arrs[i].join(' ');
            rows.push(state);
        } else {
            const choices = [];
            choices.push(arrs[i].join(' '));

            for (let i=0; i<2; i+=1) {
                const rand = random().join(' ');
                if (choices.indexOf(rand) == -1) {
                    choices.push(rand);
                } else {
                    i-=1;
                }
            }

            const options = [];
            for (let i=0; i<choices.length; i+=1) {
                const option = $$('option');
                option.innerText = choices[i];
                option.onclick = i==0
                    ? correct
                    : wrong;
                options.push(option);
            }

            options.sort(() => Math.random() > 0.5);

            const optionsEle = $$('options');
            for (let i=0; i<options.length; i+=1) {
                optionsEle.appendChild(options[i]);
            }
            rows.push(optionsEle);
        }
    }

    const res = getVal(arrs, init);
    const shape2 = $$('shapes');
    for (let i=0; i<res.length; i+=1) {
        const shape = $$('shape' + res[i]);
        shape2.appendChild(shape);
    }
    rows.push(shape2);

    const canvas = $('game');
    canvas.innerHTML = '';

    for (let i=0; i<rows.length; i+=1) {
        const row = $$('row');
        row.appendChild(rows[i]);
        canvas.appendChild(row);
    }
}

function update() {
    const FPS = 30;

    // === drawing the bar
    const diff = game.timerCurr - getTime();

    const f = x => x*x;
    const w = f(diff) / f(game.timerMax);
    $('bar').style.width = (100.0 * w) + '%';
    $('bar').className = (w > 0.75) ? 'good'
        : ((w > 0.25) ? 'mid' : 'bad');

    if (w * window.innerWidth < 30) {
        timeout();
    } else {
        setTimeout(update, 1000/FPS);
    }
}
