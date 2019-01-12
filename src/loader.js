const automata = ["frag/color-automata/"];
const shaderVariants = [
  "velocity",
  "position",
  "invert-velocity",
  "neighbor-average",
  "separation",
  "utils"
];
const automataShaders = automata
  .map(path => shaderVariants.map(variant => `${path}${variant}.frag`))
  .reduce((acc, shaders) => acc.concat(shaders), []);

const promises = [
  "frag/256-colors.frag",
  "frag/display.frag",
  "frag/game-of-life/game-of-life.frag"
]
  .concat(automataShaders)
  .map(frag =>
    fetch(frag)
      .then(response => response.text())
      .then(responseText => ({ [frag]: responseText }))
  );

export const loadShaders = function loadShaders() {
  return Promise.all(promises)
    .then(responses => Object.assign({}, ...responses))
    .then(shaders => {
      const utils = shaders["frag/color-automata/utils.frag"];
      Object.keys(shaders).forEach(name => {
        shaders[name] = shaders[name].replace("// include utils.frag", utils);
      });
      return shaders;
    });
};
