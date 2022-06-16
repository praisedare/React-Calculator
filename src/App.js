import logo from './logo.svg';
import './App.css';
import Calculator from './calculator';
import React from 'react';

class App extends React.Component{
    render() {
        return <>{calculatorUI}</>;
    }
}

/**
 * Function that updates the Calculator Screen's text
 */
let uiUpdater;

const calculatorUI = (() => {
    class CalculatorUI extends React.Component {
        constructor(props) {
            super(props);
            this.state = {};
            this.props.textUpdateCallback(text => this.setState({
                screenText: text,
            }));
        }
        render() {
            return <div className="Calculator" style={{margin: '10px auto',}}>
                <div className="Calculator-Screen">{this.state.screenText}</div>
                <div className="Calculator-Body">
                    <div className="Calculator-Keys-Column">
                        {Key7} {Key8} {Key9}
                        {Key4} {Key5} {Key6}
                        {Key1} {Key2} {Key3}
                        {Key0} {KeyPoint} {KeyDel}
                    </div>
                    <div className="Calculator-Operators-Column">
                        {KeyDivide} {KeyTimes}
                        {KeyMinus} {KeyPlus}
                        {KeyEquals}
                    </div>
                </div>
            </div>;
        }
    }

    return <CalculatorUI textUpdateCallback={updater => uiUpdater = updater}/>;
})();

class CalculatorKey extends React.Component {
    constructor(props) {
        super(props);
        this.action = this.props.action;
        this.btnRef = React.createRef();
        this.style = Object.assign({}, this.defaultStyle, this.props.style || {});
    }

    render() {
        return <button className={"Calculator-Key " + (this.props.className ?? '')} onClick={ () => this.action() }>{this.props.text}</button>
    }
}

const calculatorInput = (() => {
    class TextInputter {
        #cursorPosition = 0;

        #value = '';

        get value() {
            return this.#value;
        }
        set value(v) {
            return this.#value = v;
        }

        get cursorPosition() {
            return this.#cursorPosition;
        }
        set cursorPosition(v) {
            v = v < 0 ? 0 : v > this.#value.length ? this.#value.length : v;
            return this.#cursorPosition = v;
        }

        insert(text) {
            text = '' + text;
            this.#value = this.#value.slice(0, this.cursorPosition)
                            + text
                            + this.#value.slice(this.cursorPosition);
            this.#cursorPosition += text.length;
        }
        append(text) {
            this.#value += text;
        }

        deleteText(toLeft = true) {
            if (toLeft && !this.cursorPosition)
                return this.value;
            return this.#value = toLeft ?
                this.value.slice(0, this.cursorPosition - 1) + this.value.slice(this.cursorPosition):
                this.value.slice(0, this.cursorPosition) + this.value.slice(this.cursorPosition + 1);
        }
    }
    window.Tx = TextInputter;

    return new Proxy(new TextInputter, {
        set(target, prop, val) {
            target[prop] = val;
            uiUpdater(target.value);
            return true
        },
        call(target, meth, val) {
            target[meth](val);
            uiUpdater(target.value);
        }
    });
})();


const Key0 = <CalculatorKey text='0' action={ () => calculatorInput.insert(0) }/>,
      Key1 = <CalculatorKey text='1' action={ () => calculatorInput.insert(1) }/>,
      Key2 = <CalculatorKey text='2' action={ () => calculatorInput.insert(2) }/>,
      Key3 = <CalculatorKey text='3' action={ () => calculatorInput.insert(3) }/>,
      Key4 = <CalculatorKey text='4' action={ () => calculatorInput.insert(4) }/>,
      Key5 = <CalculatorKey text='5' action={ () => calculatorInput.insert(5) }/>,
      Key6 = <CalculatorKey text='6' action={ () => calculatorInput.insert(6) }/>,
      Key7 = <CalculatorKey text='7' action={ () => calculatorInput.insert(7) }/>,
      Key8 = <CalculatorKey text='8' action={ () => calculatorInput.insert(8) }/>,
      Key9 = <CalculatorKey text='9' action={ () => calculatorInput.insert(9) }/>,
      KeyPoint = <CalculatorKey text='.' action={ () => calculatorInput.insert('.') }/>;
 

const KeyPlus = <CalculatorKey className="Calculator-Key--Operator Calculator-Key--Width-33" text='+' action={ () => calculatorInput.insert('+') }/>,
      KeyMinus = <CalculatorKey className="Calculator-Key--Operator Calculator-Key--Width-33" text='-' action={ () => calculatorInput.insert('-') }/>,
      KeyTimes = <CalculatorKey text='×' className="Calculator-Key--Operator " action={ () => calculatorInput.insert('×') }/>,
      KeyDivide = <CalculatorKey text='÷' className="Calculator-Key--Operator" action={ () => calculatorInput.insert('÷') }/>,
      KeyDel = <CalculatorKey text='Del' className="Calculator-Key--Operator" action={ () => calculatorInput.deleteText() }/>,
      KeyAc = <CalculatorKey text='A/C' className="Calculator-Key--Operator" action={ () => calculatorInput.value = '' }/>,
      KeyEquals = <CalculatorKey text='=' className="Calculator-Key--Operator" action={
          () => {
              let expression = calculatorInput.value
                                .replaceAll('÷', '/')
                                .replaceAll('×', '*');
              calculatorInput.value = Calculator.evaluate(expression);
              calculatorInput.cursorPosition = Infinity;
          }
      }/>;

export default App;
