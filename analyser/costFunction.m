function [J, grad] = costFunction(theta, X, y)
%COSTFUNCTION Compute cost and gradient for logistic regression
%   J = COSTFUNCTION(theta, X, y) computes the cost of using theta as the
%   parameter for logistic regression and the gradient of the cost
%   w.r.t. to the parameters.

  % Initialize number of training examples
  m = length(y);

  % Calc the hypothesis values
  h = (exp(X * theta * -1) + 1) .^ -1;

  % Calc cost for negative and positive examples
  pos = h(find(y == 1), 1);
  neg = 1 - h(find(y == 0), 1);

  % Calc the total cost
  cost = -1 * log([pos; neg]);
  J = sum(cost) / m;

  % Calc gradient values
  grad = (X' * (h - y)) / m;

end
