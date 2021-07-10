import { mount } from "@vue/test-utils";
import InputText from "@/components/atoms/InputText";

describe("InputText component test", () => {
  let wrapper;
  beforeEach(() => {
    wrapper = mount(InputText, {
      propsData: {
        inputAttributes: ["text", "テストだよ"],
      },
    });
  });

  it("inputタグのtype,placeholder属性に、inputAttributes propsがそれぞれ入る", () => {
    expect(wrapper.find("input").attributes("type")).toBe("text");
    expect(wrapper.find("input").attributes("placeholder")).toBe("テストだよ");
  });

  it("inputに値が入力されると、inputイベントとその入力された値がemitされる", async () => {
    await wrapper.find("input").setValue("ゆるキャン");
    const emittedValue = wrapper.find("input").element.value;
    console.log(wrapper.find("input").element.value)
    wrapper.find("input").vm.$emit("input", emittedValue);
    expect(wrapper.emitted().input).toBeTruthy();
    expect(wrapper.emitted().input[0][0]).toBe("ゆるキャン");
  });
});
