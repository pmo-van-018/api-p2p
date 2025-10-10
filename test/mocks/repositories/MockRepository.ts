export class MockRepository {
  public static find(data: any[], properties: any) {
    return data.find((entry) => {
      return Object.keys(properties).every((key) => {
        return entry[key] === properties[key];
      });
    });
  }

  public static update(data: any[], obj: any) {
    const index = data.findIndex((p) => p.id === obj.id);
    if (index < 0) {
      obj.id = data.length + 1;
      data.push(obj);
    } else {
      data[index] = obj;
    }
    return obj;
  }
}
