export default class Calculator {
    static evaluate(expr) {
        return this.resolve(expr);
    }

    static operatorMethodMap = (new Map)
        .set('*', 'mul')
        .set('/', 'div')
        .set('+', 'add')
        .set('-', 'sub')
        .set('**', 'exp');

    static rxpNumber = `\\d+(?:\\.?\\d+)?|\\d*\\.\\d+`;

    /**
     * Regular Expression for a unary operation
     */
    static rxpUnaryOperation = `[+-]?\\s*(?:${ Calculator.rxpNumber })`;

    /**
     * Regular Expression for a binary operation
     */
    static rxpBinaryOperation = `(?<lOperand>${ Calculator.rxpUnaryOperation })\\s*[-+*/]\\s*(?<rOperand>${ Calculator.rxpUnaryOperation })`;

    static resolve(expr) {
        // Brackets first
        if (expr.includes('(')) {
            let [a, b] = this.getOuterMostSubExpressionRange(expr);

            // Resolve unary bracket expressions. e.g '-(1 + 2)'
            if ( /[+-]\s*$/.test(expr.slice(0, a - 1)) ) {
                expr = expr.slice(0, a - 1).replace(/(?<sym>[+-])\s*$/, '$<sym> 1 * ')
                       + expr.slice(a - 1);

            }

            [a, b] = this.getOuterMostSubExpressionRange(expr);

            expr = expr.slice(0, a - 1) // -1 because the returned range will exclude the parentheses
                   + this.resolve(expr.slice(a, b))
                   + expr.slice(b + 1); // +1 for the same reason above
        }

        let resolutionOrder = [
            /[*/]/, // Division and multiplication
            /[+-]/, // Addition and subtraction
        ];

        let subexpr;

        let matchSubExpr = (expr, combinator) => {
            let rgx = new RegExp(`(?<!(?:\\d+|\\))\\s*)(${ this.rxpUnaryOperation })\\s*${ combinator.replace('', '\\') }\\s*(${ this.rxpUnaryOperation })`);

            let m = expr.match(rgx);
            // Remove spaces between the unary operators and their operands
            // e.g '- 2' => '-2'.
            // Doing this because parseFloat will give `NaN` in such cases
            if (m) {
                m[1] = m[1].replaceAll(' ', '');
                m[2] = m[2].replaceAll(' ', '');
            }
            return m;
        }


        let operatorMatch;

        while ( this.hasBinaryExpression(expr) ) {
            for (let operatorSet of resolutionOrder) {

                operatorMatch = expr.match(operatorSet);
                let operator = operatorMatch?.[0];

                if (operator && ! this.isUnaryOperator(operatorMatch.index, expr)) {

                    subexpr = matchSubExpr(expr, operator);

                    expr = expr.slice(0, subexpr.index) +
                           this[this.operatorMethodMap.get(operator)](
                               parseFloat(subexpr[1]),
                               parseFloat(subexpr[2])
                           ) +
                           expr.slice(subexpr.index + subexpr[0].length);
                }
            }
        }

        return expr.trim();
    }

    /**
     * Receives the index of an operator within an expression
     * string and determines whether or not it is a unary
     * operator.
     * @param {number} idx The index of the operator within the
     *                     string
     * @param {string} expr The expression string
     * @return {boolean}
     */
    static isUnaryOperator(idx, expr) {
        let result = /[-+]/.test(expr[idx]) && // has to be a plus or minus
                // ...and must not look like a binary operator
                ! (new RegExp(`(${ this.rxpNumber }|\\))\\s*$`)).test(expr.slice(0, idx));

        return result;
    }

    /**
     * Gets the first unary expression in a string,
     * or null if there's none.
     * 
     * @param {string} expr
     * @return {array|null}
     *
     * @example
     * ```js
     * getUnaryOperation('4 * -5') // ['-5', index: 4, input: ..., groups: ...]
     * getUnaryOperation('4 + 4') // null
     * ```
     */
    static getUnaryOperation(expr) {
        return expr.match(/(?<! ?\d+\s*)(?<symbol>[+-])\s*(?:\() ? *(?<digit>\d+)/); // Match parentheticals
    }

    /**
     * Determines if an expression contains binary operations
     *
     * @param {string} expr The expression to be checked
     * @return {boolean}
     *
     * @example
     * ```js
     * hasBinaryExpression('+3') // false
     * hasBinaryExpression('1 * 8') // true
     * hasBinaryExpression('1 * 8 - 3') // true
     * ```
     */
    static hasBinaryExpression(expr) {
        return new RegExp(this.rxpBinaryOperation).test(expr);
    }

    /**
     * Returns the index positions of the start of
     * the first outer-most subexpression. e.g.
     * '5 - (8 * (11 + 4))' => [4, 16], i.e the
     * range index of the substring '8 * (11 + 4)
     * @return [number, number]
     */
    static getOuterMostSubExpressionRange(expr) {
        if (! expr.includes('('))
            return [0, expr.length];

        // Find index of matching paren
        let firstOpenParenIdx = expr.indexOf('('),
            firstCloseParenIdx = expr.indexOf(')'),
            parenNesting = expr.slice(firstOpenParenIdx + 1, firstCloseParenIdx).count('('),
            matchingCloseParenIdx = 0;

        do {
            matchingCloseParenIdx = expr.indexOf(')', matchingCloseParenIdx+1);
        } while (parenNesting--);

        return [firstOpenParenIdx + 1, matchingCloseParenIdx];
    }
    /**
     * Multiply two digits
     */
    static mul(a, b) {
        return a * b;
    }
    /**
     * Divides two digits
     */
    static div(a, b) {
        return a / b;
    }
    /**
     * Sums up its operands
     */
    static add(a, b) {
        return a + b;
    }
    /**
     * Subtracts second operand from first
     */
    static sub(a, b) {
        return a - b;
    }
    /**
     * Exponents first operand by second
     */
    static exp(a, b) {
        return a ** b;
    }
}

String.prototype.count = function(char) {
    let count = 0,
        i = -1;
    while (i++ < this.length)
        count += this[i] == char;
    return count;
};
