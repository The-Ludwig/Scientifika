---
layout: default
title: "All Talks"
navname: "All Talks"
---
<div class="container">
    <div class="row sf-talks">
        <nav class="navbar navbar-expand-lg rounded sf-searchbar" id="sf-searchbar-talks">
          <div class="container-fluid">
            <h5 class="navbar-brand mb-0" href="#">Filter</h5>
            <button class="navbar-toggler collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#sf-searchbar" aria-controls="sf-searchbar" aria-expanded="false" aria-label="Toggle navigation">
                <div class="sf-navbar-toggler-icon-minor">
                    <div class="bar"></div><div class="bar"></div>
                </div>
            </button>
            <div class="collapse navbar-collapse" id="sf-searchbar">
              <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                <li class="nav-item dropdown">
                  <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                    Ordering
                  </a>
                  <ul class="dropdown-menu">
                    <li><button class="dropdown-item bg-primary" href="#" id="sf-order-fp">Future<i class="bi bi-arrow-right"></i>Past</button></li>
                    <li><button class="dropdown-item" href="#" id="sf-order-pf">Past<i class="bi bi-arrow-right"></i>Future</button></li>
                  </ul>
                </li>
              </ul>
              <div class="d-flex" role="search" id="sf-search-talks">
                <div class="input-group me-2">
                    <input class="form-control" type="search" placeholder="Search" aria-label="Search">
                    <button class="btn btn-outline-primary" type="button" id="button-addon2"><i class="bi bi-x"></i></button>
                </div>
              </div>
            </div>
          </div>
        </nav>
        <!-- <div class="col-lg-12 card"> -->
        <!--     <div class="card-body"> -->
        <!--     </div> -->
        <!-- </div> -->
        {% assign talks_by_date = site.categories.talk | sort: "date" | reverse %}
        {% for post in talks_by_date %}
        <div class="col-lg-6 sf-talk-card" data-date='{{ post.date | date: "%Y-%m-%d" }}'>
        {% include talk_card.html talk=post%}
        </div>
        {% endfor %}
    </div>
</div>

<script defer src="{{site.baseurl}}/assets/js/filter.js"></script>
