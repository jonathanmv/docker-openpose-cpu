interface Person {
  name: string;
}

const hi = (person: Person) => console.log(person.name);

hi({ name: "Jonathan Morales Velez Garcia Palacios" });
