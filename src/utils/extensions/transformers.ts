import { FindOperator} from 'typeorm'
interface ValueTransformer<DBType, EntityType> {
    from: (val: DBType) => EntityType,
    to: (val: EntityType) => DBType
}

// transformers not work in FindOperators(issue of typeorm)
const makeTransformer = <DBType, EntityType>(transformer: ValueTransformer<DBType, EntityType>) => {
    return {
        from: transformer.from,
        to: (val: EntityType | FindOperator<EntityType>) => {
            if (val instanceof FindOperator) {
                if (!val.useParameter) {
                    return val
                }

                if (val.multipleParameters) {
                    for (const [index, v] of (val as any)._value.entries()) {
                        // hack here: overwrite the value
                        (val as any)._value[index] = transformer.to(v)
                    }
                } else {
                    // hack here: overwrite the value
                    (val as any)._value = transformer.to(val.value)
                }

                return val
            } else {
                return transformer.to(val)
            }
        }
    }
}

export const fixedBytes = (len= 32, context: string, nullable= false) =>  {
    return makeTransformer({
        from: (val: Buffer|null) => {
            if (nullable && val === null) {
                return null
            }
            return '0x' + val!.toString('hex')
        },
        to: (val: string|null) => {
            if (nullable && val === null) {
                return null
            }
            if (!/^0x[0-9a-fA-f]+/i.test(val!)) {
                throw new Error(context + ': bytes' + len + ' hex string required: ' + val)
            }

            const str = sanitizeHex(val!).padStart(len * 2, '0')
            return Buffer.from(str, 'hex')
        }
    })
}

export const compactFixedBytes = (len = 32, context: string, nullable = false) =>  {
    return makeTransformer({
        from: (val: Buffer|null) => {
            if (nullable && val === null) {
                return null
            }
            const index = val!.findIndex(x => x !== 0)
            if (index > 0) {
                val = val!.slice(index)
            }
            return '0x' + val!.toString('hex')
        },
        to: (val: string|null) => {
            if (nullable && val === null) {
                return null
            }
            if (!/^0x[0-9a-fA-f]+/i.test(val!)) {
                throw new Error(context + ': bytes' + len + ' hex string required: ' + val)
            }

            const str = sanitizeHex(val!).padStart(len * 2, '0')
            return Buffer.from(str, 'hex')
        }
    })
}

export const amount = makeTransformer({
    // 24bytes
    from: (val: Buffer) => {
        return BigInt('0x' + val.toString('hex'))
    },
    to: (val: BigInt) => {
        const str = val.toString(16).padStart(48, '0')
        return Buffer.from(str, 'hex')
    }
})

export const bytes = (context: string, nullable = false) =>  {
    return makeTransformer({
        from: (val: Buffer|null) => {
            if (nullable && val === null) {
                return null
            }
            return '0x' + val!.toString('hex')
        },
        to: (val: string|null) => {
            if (nullable && val === null) {
                return null
            }

            if (!/^0x[0-9a-fA-f]*/i.test(val!)) {
                throw new Error(context + ': bytes hex string required: ' + val)
            }

            const str = sanitizeHex(val!)
            if (str.length === 0 && nullable) {
                return null
            }

            return Buffer.from(str, 'hex')
        }
    })
}

export const simpleJSON = <T>(context: string, nullable = false) => {
    return makeTransformer({
        from: (val: string|null) => {
            if (nullable && val === null) {
                return null
            }
            return JSON.parse(val!) as T
        },
        to: (val: T | null) => {
            if (nullable && val === null) {
                return null
            }
            return JSON.stringify(val)
        }
    })
}

export const sanitizeHex = (val: string) => {
    if (val.startsWith('0x')) {
        val = val.slice(2)
    }
    if (val.length % 2) {
        val = '0' + val
    }
    return val
}
