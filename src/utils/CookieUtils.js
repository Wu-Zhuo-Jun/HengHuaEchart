import jscookie from "js-cookie";

export default class CookieUtils {
    static setCookie(key, value, options) {
        return jscookie.set(key, value, options);
    }

    static getCookie(key) {
        let data = jscookie.get(key);
        if(data){
            data =  JSON.parse(data);
        }
        return data;
    }

    static removeCookie(key) {
        return jscookie.remove(key);
    }
}