import { AppState } from '@core/AppState';
import jsonKnot from '@geometries/JSONKnotGeometry.json';
import jsonTorus from '@geometries/JSONTorusGeometry.json';
import jsonPrism from '@geometries/JSONTriangularPrismGeometry.json';
import jsonBox from '@geometries/JSONHollowBoxGeometry.json';

var url = window.location.href;
var id = url.substring(url.lastIndexOf('/') + 1);

if (!id || id == '?torus') {
  const appState = new AppState(jsonTorus);
  appState.run();
}

if (id == '?knot') {
  const appState = new AppState(jsonKnot);
  appState.run();
}

if (id == '?prism') {
  const appState = new AppState(jsonPrism);
  appState.run();
}

if (id == '?box') {
  const appState = new AppState(jsonBox);
  appState.run();
}
