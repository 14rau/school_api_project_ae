import { IApiContext } from "./api/api";
import { getConnection } from "typeorm";
import { Permission } from "./entity/Permission";
import { User } from "./entity/User";

// api object must be defined


/**
 * 
 * Either provide an function or an required permission level
 * Function will get an permission id as paramater. root overwrites the function
 */
export function Perm(permissionLevel: number | Function): any {
    return function (target, key: string, descriptor: PropertyDescriptor) {
        // save a reference to the original method this way we keep the values currently in the
        // descriptor and don't overwrite what another decorator might have done to the descriptor.
        if (descriptor === undefined) {
            descriptor = Object.getOwnPropertyDescriptor(target, key);
        }
        let originalMethod = descriptor.value;

        //editing the descriptor/value parameter
        descriptor.value = async function () {
            let args = [];
            for (let _i = 0; _i < arguments.length; _i++) {
                args[_i - 0] = arguments[_i];
            }
            if(args.length === 0) return {code: 400, message: `Illigal arugument length in function ${key}`,}

            // args 0 is api context
            let context: IApiContext = args[0];
            // let permission = await burgerKrigApi.api.permission.getPermission(context, context.user.id);
            let user = await getConnection().getRepository(User).findOne({
                relations: ["permission"],
                where: {
                    id: context.user.id
                }
            });
            if (typeof permissionLevel === "number") {
                if(permissionLevel >= user.permission.id) {
                    return originalMethod.apply(this, args)
                }
                return {code: 401, message: `Missing permissions for function ${key}`};
            } else {
                if(permissionLevel(user.permission.id) || (0 === user.permission.id)) {
                    return originalMethod.apply(this, args)
                }
                return {code: 401, message: `Missing permissions for function ${key}`};
            }
            
            // note usage of originalMethod here
            
            
            // in case we're searching and found one user and have no search embed, we can just set the type to list, since we know its a single profile
        };
        // return edited descriptor as opposed to overwriting the descriptor
        return descriptor;
    };
}