class Admin{
    $NAME; $DATE_OF_BIRTH; $PASSWORD; $EMAIL; $PHONE; $ADDRESS

    constructor(name, dateOfBirth, password, email, address) {
        this.$NAME = name;
        this.$DATE_OF_BIRTH = dateOfBirth;
        this.$PASSWORD = password;
        this.$EMAIL = email;
        this.$ADDRESS = address;
    }

    get name(){
        return this.$NAME;
    }
    get dateOfBirth(){
        return this.$DATE_OF_BIRTH;
    }
    get password(){
        return this.$PASSWORD;
    }
    get email(){
        return this.$EMAIL;
    }
    get address(){
        return this.$ADDRESS;
    }

    set name(name){
        this.$NAME = name;
    }
    set dateOfBirth(dateOfBirth){
        this.$DATE_OF_BIRTH = dateOfBirth;
    }
    set password(password){
        this.$PASSWORD = password;
    }
    set email(email){
        this.$EMAIL = email;
    }
    set address(address){
        this.$ADDRESS = address;
    }
}

class Teacher extends Admin{
    constructor(name, dateOfBirth, password, email, address, subject){
        super(name, dateOfBirth, password, email, address);
        this.$SUBJECT = subject || '';
    }
    get subject(){ return this.$SUBJECT; }
    set subject(s){ this.$SUBJECT = s; }
}

class Student{
    $NAME; $DATE_OF_BIRTH; $ADMISSION_NUMBER; $EMAIL; $CLASS; $PASSWORD
    constructor(name, dateOfBirth, admissionNumber, email, studentClass, password){
        this.$NAME = name;
        this.$DATE_OF_BIRTH = dateOfBirth;
        this.$ADMISSION_NUMBER = admissionNumber;
        this.$EMAIL = email;
        this.$CLASS = studentClass;
        this.$PASSWORD = password;
    }
    get name(){ return this.$NAME; }
}

class ParentModel{
    $NAME; $EMAIL; $PHONE; $CHILDREN;
    constructor(name, email, phone, children){
        this.$NAME = name;
        this.$EMAIL = email;
        this.$PHONE = phone;
        this.$CHILDREN = children || [];
    }
    addChild(childId){ this.$CHILDREN.push(childId); }
}

window.DataModels = { Admin, Teacher, Student, ParentModel };




