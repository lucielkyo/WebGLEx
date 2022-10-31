export const matrix3 = {
  multiply: (a, b) => ([
    a[0]*b[0] + a[3]*b[1] + a[6]*b[2], /**/ a[1]*b[0] + a[4]*b[1] + a[7]*b[2], /**/ a[2]*b[0] + a[5]*b[1] + a[8]*b[2],
    a[0]*b[3] + a[3]*b[4] + a[6]*b[5], /**/ a[1]*b[3] + a[4]*b[4] + a[7]*b[5], /**/ a[2]*b[3] + a[5]*b[4] + a[8]*b[5],
    a[0]*b[6] + a[3]*b[7] + a[6]*b[8], /**/ a[1]*b[6] + a[4]*b[7] + a[7]*b[8], /**/ a[2]*b[6] + a[5]*b[7] + a[8]*b[8],
    ]),

  // a直 * b橫
  // [ 0 1 2  [ 0 1 2
  //   3 4 5    3 4 5 
  //   6 7 8]   6 7 8]

//平移
  translate: (x, y) =>([
    1, 0, 0,
    0, 1, 0,
    x, y, 1
    ]),

//縮放
  scale: (sx, sy) =>([
    sx, 0, 0,
    0, sy, 0,
    0,  0, 1
    ]),

//投影矩陣的產生 matrix3.projection()，為平移與縮放相乘
//position / u_resolution * vec2(2, -2) 縮放 + vec2(-1, 1) 平移

//記得矩陣運算與一般運算運算不同，向量放在最右邊，向左運算，
//因此 matrix3.translate(-1, 1) 雖然放在前面，但是其 transform 是在 matrix3.translate(-1, 1) 之後的

  projection: (width, height) =>(
    matrix3.multiply(
      matrix3.translate(-1,1), 
      matrix3.scale( 2/width, -2/height )
    )
  )
};